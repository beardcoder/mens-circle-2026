import type { Metadata, Viewport } from 'next';
import { getSettings, getNextEvent } from '@/lib/payload-api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientScripts from '@/components/layout/ClientScripts';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/cormorant';
import '@/styles/app.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  const siteName = settings?.siteName || 'Männerkreis Niederbayern/ Straubing';
  const siteDescription =
    settings?.siteDescription || 'Authentischer Austausch, Gemeinschaft und persönliches Wachstum für Männer in Niederbayern.';

  return {
    title: {
      default: `${siteName} – Ein Raum für echte Begegnung`,
      template: `%s – ${siteName}`,
    },
    description: siteDescription,
    keywords: 'Männerkreis, Niederbayern, Männergruppe, persönliches Wachstum, Gemeinschaft, Männer',
    authors: [{ name: 'Markus Sommer' }],
    robots: 'index, follow',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      siteName,
      title: `${siteName} – Ein Raum für echte Begegnung`,
      description: siteDescription,
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#3d2817',
  colorScheme: 'light',
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => null);
  const nextEvent = await getNextEvent().catch(() => null);
  const siteName = settings?.siteName || 'Männerkreis Niederbayern/ Straubing';
  const hasNextEvent = !!nextEvent;

  // Umami Analytics
  const umamiEnabled = process.env.NEXT_PUBLIC_UMAMI_ENABLED === 'true';
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';

  // Organization Schema.org
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}#organization`,
    name: siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/images/logo-color.png`,
    description: settings?.siteDescription || '',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Straubing',
      addressRegion: 'Niederbayern',
      addressCountry: 'DE',
    },
    ...(settings?.contactEmail && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: settings.contactEmail,
        contactType: 'customer service',
        availableLanguage: 'German',
      },
    }),
    sameAs: settings?.socialLinks?.map((link: any) => link.url).filter(Boolean) || [],
  };

  return (
    <html lang="de" dir="ltr">
      <head>
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />

        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />

        {/* Umami Analytics */}
        {umamiEnabled && umamiWebsiteId && (
          <script defer src={umamiScriptUrl} data-website-id={umamiWebsiteId} />
        )}
      </head>
      <body>
        <a href="#main" className="skip-link">
          Zum Inhalt springen
        </a>
        <Header siteName={siteName} hasNextEvent={hasNextEvent} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
        <ClientScripts />
      </body>
    </html>
  );
}
