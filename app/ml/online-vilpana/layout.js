import { BRAND } from '../../lib/brand';

// ⚠️ DRAFT — NOINDEX until native Malayalam speaker review is complete.
export const metadata = {
  title: 'ഓൺലൈൻ വിൽപന — Kerala Sellers',
  description: 'ഓൺലൈനിൽ വിൽക്കാൻ വേണ്ടതെല്ലാം. കമ്മീഷൻ 0%. 10 മിനിറ്റ് കൊണ്ട് കട തുടങ്ങാം.',
  alternates: {
    canonical: `${BRAND.url}/ml/online-vilpana`,
    languages: {
      'ml': `${BRAND.url}/ml/online-vilpana`,
      'en': `${BRAND.url}/sell-online-kerala`,
      'x-default': `${BRAND.url}/sell-online-kerala`,
    },
  },
  robots: { index: false, follow: true },
};

export default function Layout({ children }) { return children; }
