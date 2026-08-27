import { BRAND } from '../../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
export const metadata = {
  title: 'വീട്ടിൽ നിന്ന് ഓൺലൈൻ ബിസിനസ് | Kerala Sellers',
  description: 'വീട്ടിൽ നിന്ന് ഉൽപ്പന്നങ്ങൾ വിൽക്കാൻ സ്വന്തം ഓൺലൈൻ കട. ഹോം ബേക്കറി, കൈത്തൊഴിൽ, ആഭരണം — ഏതും ആകാം.',
  alternates: {
    canonical: `${BRAND.url}/ml/veetu-business`,
    languages: {
      'ml': `${BRAND.url}/ml/veetu-business`,
      'en': `${BRAND.url}/for/home-businesses`,
      'x-default': `${BRAND.url}/for/home-businesses`,
    },
  },
  robots: { index: false, follow: true },
};

export default function Layout({ children }) { return children; }
