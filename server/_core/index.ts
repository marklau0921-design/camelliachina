import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Ensure uploads directory exists on startup ────────────────────────────
  // Hostinger does not create this directory automatically.
  // uploads/ is in .gitignore so it must be created at runtime.
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const uploadSubDirs = ["images", "media", "banners"];
  try {
    if (!fs.existsSync(uploadsRoot)) {
      fs.mkdirSync(uploadsRoot, { recursive: true });
      console.log(`[Startup] Created uploads directory: ${uploadsRoot}`);
    }
    for (const sub of uploadSubDirs) {
      const subDir = path.join(uploadsRoot, sub);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
    }
  } catch (err) {
    console.error(`[Startup] Warning: Could not create uploads directory: ${err}`);
    console.error(`[Startup] Image uploads may fail. Check server write permissions.`);
  }

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // OAuth routes removed - using admin password login only

  // Serve pre-generated static pages from static-cache/ with priority over SPA
  // Admin and API routes always bypass this and use dynamic handling
  const staticCacheDir = path.resolve(process.cwd(), "static-cache");
  app.use((req, res, next) => {
    if (req.path.startsWith("/admin") || req.path.startsWith("/api") || req.path.startsWith("/manus-storage") || req.path.startsWith("/uploads")) {
      return next();
    }
    const routePath = req.path === "/" ? "/index.html" : `${req.path.replace(/\/$/, "")}/index.html`;
    const filePath = path.join(staticCacheDir, routePath);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    next();
  });

  // Serve uploaded files (images, media, etc.) from the uploads/ directory
  app.use("/uploads", express.static(uploadsRoot, {
    maxAge: "1d",
    etag: true,
    lastModified: true,
  }));

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
