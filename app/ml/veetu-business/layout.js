import { BRAND } from '../../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
export const metadata = {
  title: 'വീട്ടിൽ നിന്ന് ഓൺലൈൻ ബിസിനസ് | Kerala Sellers',
  description: 'വീട്ടിൽ നിന്ന് ഉൽപ്പന്നങ്ങൾ വിൽക്കാൻ സ്വന്തം ഓൺലൈൻ കട. ഹോം ബേക്കറി, കൈത്തൊഴിൽ, ആഭരണം — ഏതും ആകാം.',
  alternates: {
    canonical: `${BRAND.url}/ml/veetu-business`,
    languages: {
      'en-IN': `${BRAND.url}/for/home-businesses`,
      'ml-IN': `${BRAND.url}/ml/veetu-business`,
      'x-default': `${BRAND.url}/for/home-businesses`,
    },
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }) { return children; }
