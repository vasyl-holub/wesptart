import type { MetadataRoute } from "next";

/**
 * Закриваємо те саме, що й старий сайт, плюс наші службові адреси.
 * Crawl-delay старого robots.txt не переносимо: Google його ігнорує,
 * а навантаження тепер тримає Next, а не Django.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/cart",
        "/checkout",
        "/login",
        "/register",
        "/requests",
        "/search",
        "/api/",
      ],
    },
    sitemap: "https://westpart.ua/sitemap.xml",
  };
}
