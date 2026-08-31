import { BRAND } from '../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
// DO NOT publish without review. Contact team for reviewer.

export const metadata = {
  title: 'Kerala Sellers — ഓൺലൈനിൽ വിൽക്കാനും, മാനേജ് ചെയ്യാനും, വളർത്താനും',
  description:
    'ഇൻസ്റ്റാഗ്രാമിലും വാട്സ്ആപ്പിലും ബിസിനസ് ചെയ്യുന്നവർക്ക് സ്വന്തം ഓൺലൈൻ കട. കമ്മീഷൻ 0%. 10 മിനിറ്റ് കൊണ്ട് തുടങ്ങാം.',
  alternates: {
    canonical: `${BRAND.url}/ml/`,
    languages: {
      'ml': `${BRAND.url}/ml/`,
      'en': `${BRAND.url}/`,
      'x-default': `${BRAND.url}/`,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MlHomeLayout({ children }) {
  return children;
}
