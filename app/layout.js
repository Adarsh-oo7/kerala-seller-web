import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { CartProvider } from './context/CartContext';
import Header from '../components/common/Header'; // ✅ Import the Header
import Footer from '../components/common/Footer'; // ✅ Import a Footer (optional)
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
          <Header /> {/* ✅ Add the Header component here */}
          <main>
            {children}
          </main>
          {/* <Footer /> You can add a footer here if you have one */}
        </CartProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}