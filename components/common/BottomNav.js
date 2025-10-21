"use client";

import Link from "next/link";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCart } from "../../app/context/CartContext";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const { carts } = useCart();
  const pathname = usePathname();

  // ✅ Total cart items
  const cartItemCount = Object.values(carts || {})
    .flat()
    .reduce((count, item) => count + item.quantity, 0);

  return (
    <div className={styles.bottomNav}>
      <Link
        href="/"
        className={`${styles.bottomNavItem} ${
          pathname === "/" ? styles.active : ""
        }`}
      >
        <Home size={20} weight="duotone" className={styles.navIcon} />
      </Link>

      <Link
        href="/shop"
        className={`${styles.bottomNavItem} ${
          pathname === "/shop" ? styles.active : ""
        }`}
      >
        <ShoppingBag size={20} weight="duotone" className={styles.navIcon} />
      </Link>

      <Link
        href="/cart"
        className={`${styles.bottomNavItem} ${
          pathname === "/cart" ? styles.active : ""
        }`}
      >
        <ShoppingCart size={20} weight="duotone" className={styles.navIcon} />
        {cartItemCount > 0 && (
          <span className={styles.cartBadge}>{cartItemCount}</span>
        )}
      </Link>

      <Link
        href="/profile"
        className={`${styles.bottomNavItem} ${
          pathname === "/profile" ? styles.active : ""
        }`}
      >
        <User size={20} weight="duotone" className={styles.navIcon} />
      </Link>
    </div>
  );
}

