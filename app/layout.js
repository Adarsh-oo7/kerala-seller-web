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
  title: "Kerala Sellers | Online store for Instagram and WhatsApp sellers in Kerala",
  description:
    "Already selling on Instagram or WhatsApp? Get your own Kerala store link, take orders in one place, and keep 100% of your sales. Zero commission.",
  authors: [{ name: 'Adarsh B S' }, { name: 'Aromal V G' }],
  creator: 'Digital Product Solutions',
  publisher: 'Kerala Sellers',
  
  // ✅ Favicon - Next.js will automatically look for favicon.ico in app/ folder
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Existing stylesheets */}
        <link rel="stylesheet" href="/assets/css/style.css" />
        
        {/* ✅ OPTIMIZED: Google Fonts (removed duplicate link) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Quicksand:wght@300..700&display=swap" 
          rel="stylesheet"
        />
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
