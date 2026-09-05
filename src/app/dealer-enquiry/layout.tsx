import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Mehak Dealer | Trade & Distribution Enquiries',
  description:
    'Connect with Hari Har Industries for trade, dealer, distributor, and bulk supply enquiries for Mehak sanitary hardware products.',
  openGraph: {
    title: 'Become a Mehak Dealer | Trade & Distribution Enquiries',
    description:
      'Connect with Hari Har Industries for trade, dealer, distributor, and bulk supply enquiries for Mehak sanitary hardware products.',
  },
};

export default function DealerEnquiryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
