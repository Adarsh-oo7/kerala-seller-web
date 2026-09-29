import { BRAND } from '../lib/brand';

export const metadata = {
  title: 'Contact Us | Kerala Sellers Support & Office',
  description:
    'Contact the Kerala Sellers team for seller onboard support, POS billing inquiries, partnership, or technical assistance in Kerala.',
  alternates: {
    canonical: `${BRAND.url}/contact`,
  },
  openGraph: {
    title: 'Contact Us | Kerala Sellers Support & Office',
    description:
      'Get in touch with Kerala Sellers support team for seller onboarding, POS billing demo, or help setting up your online store.',
    url: `${BRAND.url}/contact`,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ContactLayout({ children }) {
  return children;
}
