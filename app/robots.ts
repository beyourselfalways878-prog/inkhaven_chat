import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/chat/', '/profile/'],
    },
    sitemap: 'https://www.inkhaven.in/sitemap.xml',
  };
}
