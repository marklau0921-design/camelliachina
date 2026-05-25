import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import fs from "fs";
import path from "path";
import { UPLOADS_ROOT } from "../storage";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  // Debug API: Check uploads folder
  debugUploads: adminProcedure.query(() => {
    const uploadsRoot = UPLOADS_ROOT;
    const result: any = {
      uploadsRoot,
      exists: fs.existsSync(uploadsRoot),
      isDirectory: fs.existsSync(uploadsRoot) && fs.statSync(uploadsRoot).isDirectory(),
      files: [],
    };

    if (result.exists && result.isDirectory) {
      try {
        const items = fs.readdirSync(uploadsRoot, { withFileTypes: true });
        result.files = items.map(item => ({
          name: item.name,
          isDirectory: item.isDirectory(),
          path: path.join(uploadsRoot, item.name),
        }));

        // List media files
        const mediaDir = path.join(uploadsRoot, "media");
        if (fs.existsSync(mediaDir)) {
          result.mediaFiles = fs.readdirSync(mediaDir).map(file => ({
            name: file,
            path: path.join(mediaDir, file),
            size: fs.statSync(path.join(mediaDir, file)).size,
          }));
        }
      } catch (err) {
        result.error = (err as Error).message;
      }
    }

    return result;
  }),
});
