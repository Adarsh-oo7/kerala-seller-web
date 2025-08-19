"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCart } from "../../app/context/CartContext";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const [show, setShow] = useState(false);
  const { carts } = useCart();
  const pathname = usePathname();

  // ✅ Total cart items
  const cartItemCount = Object.values(carts || {})
    .flat()
    .reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`bottom-nav ${show ? "show" : ""}`}>
      <Link
        href="/"
        className={`bottom-nav-item ${pathname === "/" ? "active" : ""}`}
      >
        <Home size={20} weight="duotone"  />
      </Link>
      <Link
        href="/shop"
        className={`bottom-nav-item ${pathname === "/shop" ? "active" : ""}`}
      >
        <ShoppingBag size={20} weight="duotone" />
      </Link>
      <Link
        href="/cart"
        className={`bottom-nav-item cart-icon ${pathname === "/cart" ? "active" : ""}`}
      >
        <ShoppingCart size={20} weight="duotone" />
        {cartItemCount > 0 && (
          <span className="cart-badge">{cartItemCount}</span>
        )}
      </Link>
      <Link
        href="/profile"
        className={`bottom-nav-item ${pathname === "/profile" ? "active" : ""}`}
      >
        <User size={20} weight="duotone" />
      </Link>
    </div>
  );
}
