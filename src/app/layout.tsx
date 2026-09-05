import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehak-sanitary.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Mehak Sanitary Hardware | Hari Har Industries',
  description:
    'Mehak by Hari Har Industries offers sanitary hardware products including health faucets, waste couplings, floor jali, sink couplings, jet sprays, waste pipes, bathroom accessories and other sanitary hardware.',
  keywords: [
    'Mehak Sanitary Hardware',
    'Hari Har Industries',
    'Complete Bathroom Solution',
    'Health Faucet',
    'Waste Coupling',
    'Floor Jali',
    'Sink Coupling',
    'Jet Spray',
    'Waste Pipe',
    'Bathroom Accessories',
    'Sanitary Hardware Manufacturer India',
  ],
  authors: [{ name: 'Hari Har Industries' }],
  icons: {
    icon: '/images/mehak-logo.png',
    apple: '/images/mehak-logo.png',
  },
  openGraph: {
    title: 'Mehak Sanitary Hardware | Hari Har Industries',
    description:
      'Mehak by Hari Har Industries offers sanitary hardware products including health faucets, waste couplings, floor jali, sink couplings, jet sprays, waste pipes, bathroom accessories and other sanitary hardware.',
    siteName: 'Mehak Sanitary Hardware',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/mehak-logo.png',
        width: 800,
        height: 800,
        alt: 'Mehak Sanitary Hardware Logo',
      },
    ],
  },
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hari Har Industries',
  brand: {
    '@type': 'Brand',
    name: 'Mehak',
    slogan: 'Complete Bathroom Solution',
  },
  url: siteUrl,
  logo: `${siteUrl}/images/mehak-logo.png`,
  email: 'piyushverma282005@gmail.com',
  telephone: ['+918307721917', '+919354222883', '+919518405643'],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-8307721917',
      contactType: 'sales',
      availableLanguage: ['English', 'Hindi'],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
