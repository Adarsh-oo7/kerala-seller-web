import { BRAND } from '../../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
export const metadata = {
  title: 'ഓൺലൈൻ വിൽപ്പന കേരളത്തിൽ എങ്ങനെ തുടങ്ങാം | Online Vilpana Kerala Sellers',
  description: 'കേരളത്തിൽ സ്വന്തമായി ഓൺലൈൻ ഷോപ്പ് തുടങ്ങാൻ (online shop thudangan). 0% കമ്മീഷനിൽ സ്വന്തം വെബ്സൈറ്റിലൂടെ ഉൽപ്പന്നങ്ങൾ വിൽക്കാം. ₹99/മാസം മുതൽ.',
  keywords: [
    'ഓൺലൈൻ വിൽപ്പന',
    'online vilpana',
    'ഓൺലൈൻ ഷോപ്പ് തുടങ്ങാൻ',
    'online shop thudangan',
    'കട ഓൺലൈൻ ആക്കാൻ',
    'kada online aakkan',
    'kerala online store',
    'ecommerce website kerala',
    'ഓൺലൈൻ കട തുടങ്ങാൻ',
  ],
  alternates: {
    canonical: `${BRAND.url}/ml/online-vilpana`,
    languages: {
      'en-IN': `${BRAND.url}/sell-online-kerala`,
      'ml-IN': `${BRAND.url}/ml/online-vilpana`,
      'x-default': `${BRAND.url}/sell-online-kerala`,
    },
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }) { return children; }
