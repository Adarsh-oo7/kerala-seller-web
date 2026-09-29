import { BRAND } from '../lib/brand';

export const metadata = {
  title: 'Shipping and Delivery Policy | Kerala Sellers',
  description:
    'Shipping and Delivery Policy for Kerala Sellers POS hardware kits and physical equipment deliveries across Kerala.',
  alternates: {
    canonical: `${BRAND.url}/shipping-delivery`,
  },
  openGraph: {
    title: 'Shipping and Delivery Policy | Kerala Sellers',
    description:
      'Information on shipping timelines, courier partners, and tracking for Kerala Sellers POS equipment.',
    url: `${BRAND.url}/shipping-delivery`,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ShippingDeliveryLayout({ children }) {
  return children;
}
