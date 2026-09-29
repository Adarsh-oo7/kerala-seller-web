import { BRAND } from '../../lib/brand';

export const metadata = {
  title: 'Seller Registration | Create Your Own Online Store | Kerala Sellers',
  description:
    'Register as a seller on Kerala Sellers. Launch your own online store in 10 minutes from ₹99/month with 0% marketplace commission. Free setup.',
  alternates: {
    canonical: `${BRAND.url}/register/seller`,
  },
  openGraph: {
    title: 'Seller Registration | Create Your Own Online Store | Kerala Sellers',
    description:
      'Launch your own online store in 10 minutes. 0% commission, shareable store link, mobile billing and inventory management.',
    url: `${BRAND.url}/register/seller`,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RegisterSellerLayout({ children }) {
  return children;
}
