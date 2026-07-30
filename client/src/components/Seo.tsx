import { useEffect } from "react";
import { useLocation } from "wouter";

const SITE_URL = "https://camelliachina.com";
const DEFAULT_TITLE = "CamelliaChina";
const DEFAULT_DESCRIPTION =
  "CamelliaChina creates tailor-made private journeys across China, connecting discerning travellers with local culture, landscapes and meaningful experiences.";

const routeSeo: Record<string, { title: string; description: string }> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/destinations": {
    title: "China Destinations | CamelliaChina",
    description: "Explore remarkable destinations across China and discover private journeys designed around culture, nature and local life.",
  },
  "/experiences": {
    title: "Private China Experiences | CamelliaChina",
    description: "Discover meaningful private experiences in China, from food and heritage to nature, wellness and everyday local life.",
  },
  "/about": {
    title: "About CamelliaChina | Bespoke China Travel",
    description: "Meet CamelliaChina, a China-based travel company creating thoughtful, fully personalised private journeys.",
  },
  "/about/our-team": {
    title: "Our Team | CamelliaChina",
    description: "Meet the local travel experts behind CamelliaChina and the people who shape each tailor-made journey.",
  },
  "/about/why-us": {
    title: "Why CamelliaChina | Local China Travel Experts",
    description: "Learn how CamelliaChina combines local knowledge, personalised planning and on-the-ground support for a more meaningful journey.",
  },
  "/make-an-enquiry": {
    title: "Plan Your Private China Journey | CamelliaChina",
    description: "Tell CamelliaChina what you want from your journey and start planning a tailor-made private trip through China.",
  },
  "/plan-your-trip": {
    title: "Plan Your China Trip | CamelliaChina",
    description: "Start designing a tailor-made China itinerary with local specialists and private, carefully selected experiences.",
  },
};

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Seo() {
  const [location] = useLocation();

  useEffect(() => {
    const cleanPath = location.split("?")[0].replace(/\/+$/, "") || "/";
    const isPrivate = cleanPath.startsWith("/admin")
      || cleanPath.startsWith("/experience-preview")
      || cleanPath.startsWith("/template")
      || cleanPath === "/font-showcase"
      || cleanPath === "/404";

    let seo = routeSeo[cleanPath];
    if (!seo && cleanPath.startsWith("/destinations/")) {
      const name = humanizeSlug(cleanPath.split("/").pop() || "China");
      seo = {
        title: `${name} Travel | CamelliaChina`,
        description: `Explore ${name} with CamelliaChina through a tailor-made private journey shaped by local culture, landscapes and experiences.`,
      };
    } else if (!seo && cleanPath.startsWith("/experiences/")) {
      const name = humanizeSlug(cleanPath.split("/").pop() || "China Experience");
      seo = {
        title: `${name} | CamelliaChina`,
        description: `Discover ${name}, a private China experience curated by CamelliaChina.`,
      };
    } else if (!seo && cleanPath.startsWith("/itinerary/")) {
      const name = humanizeSlug(cleanPath.split("/").pop() || "China Journey");
      seo = {
        title: `${name} | CamelliaChina`,
        description: `Explore a tailor-made ${name} itinerary with CamelliaChina.`,
      };
    }
    seo ||= { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };

    const canonicalUrl = `${SITE_URL}${cleanPath === "/" ? "/" : cleanPath}`;
    document.title = seo.title;
    setMeta('meta[name="description"]', "name", "description", seo.description);
    setMeta('meta[name="robots"]', "name", "robots", isPrivate ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta('meta[property="og:title"]', "property", "og:title", seo.title);
    setMeta('meta[property="og:description"]', "property", "og:description", seo.description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [location]);

  return null;
}
