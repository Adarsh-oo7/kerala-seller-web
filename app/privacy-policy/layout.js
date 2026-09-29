import { BRAND } from '../lib/brand';

export const metadata = {
  title: 'Privacy Policy | Kerala Sellers',
  description:
    'Privacy Policy for Kerala Sellers platform. Learn how we handle your personal data, store information, and transaction security.',
  alternates: {
    canonical: `${BRAND.url}/privacy-policy`,
  },
  openGraph: {
    title: 'Privacy Policy | Kerala Sellers',
    description:
      'Learn how Kerala Sellers protects your privacy and handles merchant data securely.',
    url: `${BRAND.url}/privacy-policy`,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function PrivacyPolicyLayout({ children }) {
  return children;
}
