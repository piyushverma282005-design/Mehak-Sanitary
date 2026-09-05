import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sanitary Hardware Catalogue | Mehak by Hari Har Industries',
  description:
    'Browse our collection of sanitary hardware including health faucets, waste couplings, floor jali, sink couplings, jet sprays, waste pipes, and bathroom accessories.',
  openGraph: {
    title: 'Sanitary Hardware Catalogue | Mehak by Hari Har Industries',
    description:
      'Browse our collection of sanitary hardware including health faucets, waste couplings, floor jali, sink couplings, jet sprays, waste pipes, and bathroom accessories.',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
