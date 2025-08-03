import { GeistSans } from "geist/font/sans"; // ✅ Correct import for Geist Sans
import { GeistMono } from "geist/font/mono";  // ✅ Correct import for Geist Mono
import { CartProvider } from './context/CartContext'; // ✅ Import the CartProvider
import './globals.css'; // ✅ Correct way to import global CSS
import Script from 'next/script';

export const metadata = {
  title: "Kerala Sellers",
  description: "Your Online Store Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider> {/* ✅ Wrap the app so the cart is available everywhere */}
          {children}
        </CartProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}