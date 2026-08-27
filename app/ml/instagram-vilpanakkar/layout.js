import { BRAND } from '../../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
export const metadata = {
  title: 'ഇൻസ്റ്റാഗ്രാം വിൽപനക്കാർക്ക് ഓൺലൈൻ കട | Kerala Sellers',
  description: 'Instagram bio-ൽ ഒരു ലിങ്ക്. ഉപഭോക്താക്കൾ ബ്രൗസ് ചെയ്ത് ഓർഡർ ചെയ്യും. DM chaos ഇനി വേണ്ട.',
  alternates: {
    canonical: `${BRAND.url}/ml/instagram-vilpanakkar`,
    languages: {
      'ml': `${BRAND.url}/ml/instagram-vilpanakkar`,
      'en': `${BRAND.url}/for/instagram-sellers`,
      'x-default': `${BRAND.url}/for/instagram-sellers`,
    },
  },
  robots: { index: false, follow: true },
};

export default function Layout({ children }) { return children; }
