import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { CartProvider } from './context/CartContext';
// We no longer import Header/Footer here globally
import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: "Kerala Sellers",
  description: "Your Online Store Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>
          {/* ✅ Header is removed from here */}
          <main>
            {children}
          </main>
        </CartProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}