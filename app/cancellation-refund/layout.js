import { BRAND } from '../lib/brand';

export const metadata = {
  title: 'Cancellation and Refund Policy | Kerala Sellers',
  description:
    'Transparent Cancellation & Refund Policy for Kerala Sellers subscription plans and POS hardware kit purchases.',
  alternates: {
    canonical: `${BRAND.url}/cancellation-refund`,
  },
  openGraph: {
    title: 'Cancellation and Refund Policy | Kerala Sellers',
    description:
      'Learn about subscription cancellation, refund eligibility, and POS hardware return terms at Kerala Sellers.',
    url: `${BRAND.url}/cancellation-refund`,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function CancellationRefundLayout({ children }) {
  return children;
}
