import { BRAND } from '../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
// DO NOT publish without review. Contact team for reviewer.

export const metadata = {
  title: 'ഓൺലൈൻ ഷോപ്പ് തുടങ്ങാൻ | ഓൺലൈൻ ബിസിനസ് കേരളം | Kerala Sellers',
  description:
    'കേരളത്തിൽ സ്വന്തമായി ഓൺലൈൻ ഷോപ്പ് തുടങ്ങാൻ Kerala Sellers. കടയുടെ ബില്ലിംഗ് സോഫ്റ്റ്വെയർ, ഇൻവെന്ററി, 0% കമ്മീഷൻ. Online shop thudangan — Kerala Sellers.',
  alternates: {
    canonical: `${BRAND.url}/ml`,
    languages: {
      'en-IN': `${BRAND.url}/`,
      'ml-IN': `${BRAND.url}/ml`,
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
