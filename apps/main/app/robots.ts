import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/integrations/',
          '/profile/',
          '/lien-waiver/',
          '/onboarding/',
          '/vendors/',
          '/bills/',
          '/hr/',
          '/legal/',
          '/report/',
          '/project-bills/',
          '/_next/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
