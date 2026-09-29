import { BRAND } from '../lib/brand';

export const metadata = {
  title: 'Terms and Conditions | Kerala Sellers Platform',
  description:
    'Terms and Conditions of use for Kerala Sellers ecommerce and POS billing software platform for merchants and shoppers.',
  alternates: {
    canonical: `${BRAND.url}/terms-and-conditions`,
  },
  openGraph: {
    title: 'Terms and Conditions | Kerala Sellers Platform',
    description:
      'Review terms of use for Kerala Sellers digital store builder and POS services.',
    url: `${BRAND.url}/terms-and-conditions`,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function TermsLayout({ children }) {
  return children;
}
