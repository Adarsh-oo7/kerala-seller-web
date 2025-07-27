'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";

export default function HomeHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <header className="BaseHomeHeader">
      {/* Left - Navigation */}
      <div className="nav-left">
        <div className="mobileMenuContainer">
          <button className="iconButton" onClick={toggleSidebar} aria-label="Open navigation menu">
            <Menu size={24} />
          </button>
        </div>

        <nav className="desktopNav">
          <Link href="/" className="navLinkActive">Home</Link>
          <Link href="/catalog" className="navLink">Catalog</Link>
          <Link href="/contact" className="navLink">Contact</Link>
        </nav>
      </div>

      {/* Center - Logo */}
      <div className="logoContainer">
        <Link href="/" className="logo">
          {/* <ShoppingBag size={24} /> */}
          KeralaSellers
        </Link>
      </div>

      {/* Right - Icons */}
      <div className="iconsContainer">
        <Link href="/search" className="iconButton" aria-label="Search">
          <Search size={24} />
          <span className="srOnly">Search</span>
        </Link>
        <Link href="/login" className="iconButton loginButtonDesktop" aria-label="Login">
          <User size={24} />
          <span className="srOnly">Login</span>
        </Link>
        <Link href="/cart" className="iconButton" aria-label="Shopping Cart">
          <ShoppingBag size={24} />
          <span className="srOnly">Shopping Cart</span>
        </Link>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "sidebarOpen" : ""}`}>
        <button className="sidebarCloseButton" onClick={toggleSidebar} aria-label="Close navigation menu">
          <X size={24} />
        </button>
        <div className="sidebarContent">
          <Link href="/" className="sidebarLink" onClick={toggleSidebar}>Home</Link>
          <Link href="/catalog" className="sidebarLink" onClick={toggleSidebar}>Catalog</Link>
          <Link href="/contact" className="sidebarLink" onClick={toggleSidebar}>Contact</Link>
          <Link href="/login" className="sidebarLink" onClick={toggleSidebar}>
            <User size={20} className="inlineIcon" />
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
