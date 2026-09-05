import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Hari Har Industries — Mehak Sanitary Hardware',
  description:
    'Get in touch with Hari Har Industries for Mehak sanitary hardware product inquiries, bulk quotes, dealership queries, and trade support.',
  openGraph: {
    title: 'Contact Us | Hari Har Industries — Mehak Sanitary Hardware',
    description:
      'Get in touch with Hari Har Industries for Mehak sanitary hardware product inquiries, bulk quotes, dealership queries, and trade support.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
