import { BRAND } from '../../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
export const metadata = {
  title: 'വാട്സ്ആപ്പ് ഓർഡർ മാനേജ്മെന്റ് | Kerala Sellers',
  description: 'വാട്സ്ആപ്പ് ഓർഡറുകൾ ഒരു ഡാഷ്ബോർഡിൽ. കമ്മീഷൻ ഇല്ല. WhatsApp Status-ൽ സ്റ്റോർ ലിങ്ക് ഷെയർ ചെയ്യൂ.',
  alternates: {
    canonical: `${BRAND.url}/ml/whatsapp-vilpanakkar`,
    languages: {
      'ml': `${BRAND.url}/ml/whatsapp-vilpanakkar`,
      'en': `${BRAND.url}/for/whatsapp-sellers`,
      'x-default': `${BRAND.url}/for/whatsapp-sellers`,
    },
  },
  robots: { index: false, follow: true },
};

export default function Layout({ children }) { return children; }
