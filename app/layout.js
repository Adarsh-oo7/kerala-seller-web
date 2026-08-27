import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { CartProvider } from './context/CartContext';
import './globals.css';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrganizationJsonLd from '../components/seo/OrganizationJsonLd';

// ✅ ADD: Viewport configuration (fixes themeColor warning)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a4845',
};

// ✅ Metadata configuration
export const metadata = {
  metadataBase: new URL('https://www.keralasellers.in'),
  // 38 chars — default fallback title for pages without their own
  title: 'Kerala Sellers | Sell Online in Kerala',
  description:
    'Own Kerala store for Instagram & WhatsApp sellers. Share a store link, take orders in one place, keep 100% of sales. Zero commission. Free setup.',
  authors: [{ name: 'Adarsh B S' }, { name: 'Aromal V G' }],
  creator: 'Digital Product Solutions',
  publisher: 'Kerala Sellers',
  
  // ✅ Favicon
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Existing stylesheets */}
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/seo-pages.css" />
        
        {/* ✅ OPTIMIZED: Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Quicksand:wght@300..700&display=swap" 
          rel="stylesheet"
        />
        {/* LinkedIn social profile association */}
        <link rel="me" href="https://www.linkedin.com/showcase/kerala-sellers/" />
        <link rel="me" href="https://www.instagram.com/kerala_sellers/" />
        <link rel="me" href="https://www.facebook.com/profile.php?id=61586008980027" />
        <OrganizationJsonLd />
      </head>

      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <main>
            {children}
          </main>
        </CartProvider>
        
        {/* Razorpay Script */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}
