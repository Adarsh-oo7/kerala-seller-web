import { BRAND } from '../../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
export const metadata = {
  title: 'വീട്ടിൽ നിന്ന് ഓൺലൈൻ ബിസിനസ് തുടങ്ങാൻ | Home Business Kerala Sellers',
  description: 'വീട്ടിലിരുന്ന് സ്വന്തം ഓൺലൈൻ കട (veetu business) തുടങ്ങാം. ഹോം ബേക്കറി, വസ്ത്രങ്ങൾ, റീസെല്ലിങ്, കൈത്തൊഴിൽ ഉൽപ്പന്നങ്ങൾ എന്നിവ വിൽക്കാൻ ₹99/മാസം മുതൽ.',
  keywords: [
    'വീട്ടിൽ നിന്ന് ബിസിനസ്',
    'veetu business',
    'home business kerala',
    'ഓൺലൈൻ ബിസിനസ് തുടങ്ങാൻ',
    'online business thudangan',
    'resellers in kerala',
    'direct selling kerala',
    'ചെറിയ ബിസിനസ് സോഫ്റ്റ്വെയർ',
  ],
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
