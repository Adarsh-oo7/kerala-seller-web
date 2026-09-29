import { BRAND } from '../../lib/brand';

export const metadata = {
  title: 'Create Online Store Kerala | Seller Registration | Kerala Sellers',
  description:
    'Create your online store in Kerala in 10 minutes from ₹99/month. Free registration, 0% marketplace commission, instant UPI checkout, and mobile POS billing.',
  alternates: {
    canonical: `${BRAND.url}/register/seller`,
  },
  openGraph: {
    title: 'Create Online Store Kerala | Seller Registration | Kerala Sellers',
    description:
      'Launch your own online store in Kerala in 10 minutes. 0% commission, shareable store link, mobile billing and inventory management.',
    url: `${BRAND.url}/register/seller`,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RegisterSellerLayout({ children }) {
  return children;
}
