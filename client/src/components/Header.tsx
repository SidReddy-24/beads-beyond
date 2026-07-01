'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Heart, User, Shield, Menu, X, Gem, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { user, cart, wishlist, logout, theme, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop All' },
    { href: '/shop?category=rings', label: 'Rings' },
    { href: '/shop?category=earrings', label: 'Earrings' },
    { href: '/shop?category=necklaces', label: 'Necklaces' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-md border-b shadow-sm'
            : 'border-b'
        }`}
        style={{
          backgroundColor: scrolled ? 'rgba(var(--bg-rgb, 255,255,255), 0.95)' : 'var(--bg)',
          borderColor: 'var(--grey-mid)',
        }}
      >
        {/* Top announcement bar */}
        {!scrolled && (
          <div className="border-b py-1.5 px-4 text-center hidden md:block" style={{ backgroundColor: 'var(--babypink)', borderColor: 'var(--pink-accent)' }}>
            <p className="text-[0.62rem] tracking-[0.2em] uppercase font-sans font-medium" style={{ color: 'var(--rosegold)' }}>
              ✦ Free shipping on orders above ₹5,000 &nbsp;|&nbsp; Lifetime warranty on all pieces ✦
            </p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: 'var(--babypink)', borderColor: 'var(--pink-accent)' }}>
                <Gem className="w-4 h-4" style={{ color: 'var(--rosegold)' }} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg font-semibold tracking-[0.12em]" style={{ color: 'var(--fg)' }}>
                  BEADS
                </span>
                <span className="text-[0.6rem] tracking-[0.35em] uppercase -mt-0.5 font-sans" style={{ color: 'var(--rosegold)' }}>
                  & BEYOND
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link text-[0.7rem] tracking-[0.15em] uppercase font-sans font-medium">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-1">
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 mr-3 text-[0.62rem] font-medium tracking-[0.15em] uppercase text-white bg-[#231F20] hover:bg-[#C88C96] transition-all duration-200"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#8E8A8B] hover:text-[#C88C96] hover:bg-[#FCF3F4] transition-all duration-200"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 stroke-[1.5]" /> : <Moon className="w-4 h-4 stroke-[1.5]" />}
              </button>

              {/* Wishlist */}
              <Link
                href="/account/orders?tab=wishlist"
                className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#8E8A8B] hover:text-[#C88C96] hover:bg-[#FCF3F4] transition-all duration-200"
              >
                <Heart className="w-4 h-4 stroke-[1.5]" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[0.55rem] font-bold text-white bg-[#C88C96] rounded-full font-sans">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#8E8A8B] hover:text-[#C88C96] hover:bg-[#FCF3F4] transition-all duration-200"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[0.55rem] font-bold text-white bg-[#C88C96] rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User / Auth */}
              {user ? (
                <div className="flex items-center gap-3 ml-2">
                  <Link href="/account" className="flex items-center gap-2 text-[#8E8A8B] hover:text-[#C88C96] transition-colors duration-200">
                    <div className="w-8 h-8 rounded-full bg-[#FCF3F4] border border-[#E5B5B8] flex items-center justify-center text-[0.65rem] font-bold text-[#C88C96]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-[0.65rem] tracking-[0.1em] uppercase text-[#8E8A8B] hover:text-red-500 transition-colors duration-200 font-medium font-sans"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="ml-2 btn-luxury-outline text-[0.62rem] py-2 px-4"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center text-[#8E8A8B]"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 stroke-[1.5]" /> : <Moon className="w-4 h-4 stroke-[1.5]" />}
              </button>
              <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center text-[#8E8A8B]">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-[0.55rem] font-bold text-white bg-[#C88C96] rounded-full font-sans">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 flex items-center justify-center text-[#8E8A8B] hover:text-[#C88C96] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-72 border-l flex flex-col transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--grey-mid)' }}>
            <span className="text-xs uppercase font-sans tracking-widest font-medium" style={{ color: 'var(--fg)' }}>MENU</span>
            <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--grey-muted)' }} className="hover:text-[#C88C96] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-6 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-[0.75rem] tracking-[0.15em] uppercase border-b transition-colors duration-200 font-sans hover:text-[#C88C96]"
                style={{ color: 'var(--grey-muted)', borderColor: 'var(--grey-light)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-6 pb-8 space-y-3 border-t pt-5" style={{ borderColor: 'var(--grey-mid)' }}>
            {user ? (
              <>
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 hover:text-[#C88C96] transition-colors" style={{ color: 'var(--fg)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--rosegold)' }} />
                  <span className="text-sm font-sans font-medium">{user.name}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[#C88C96] text-xs font-semibold uppercase tracking-wider font-sans">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-red-500 font-sans font-medium">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-luxury w-full justify-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Header spacer — matches header height (80px nav + ~32px announcement bar on md+) */}
      <div className={`transition-all duration-300 ${scrolled ? 'h-20' : 'h-20 md:h-[calc(80px+2.25rem)]'}`} />
    </>
  );
}
