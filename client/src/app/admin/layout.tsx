'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Trash2, FolderTree, Ticket, Image, PackageOpen, Users, LogOut, Moon, Sun } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, contextLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    if (contextLoading) return;
    if (!token || user?.role !== 'admin') {
      router.replace('/');
    } else {
      setAuthorized(true);
    }
  }, [token, user, contextLoading, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--pink-accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm font-montserrat tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>Verifying credentials…</p>
        </div>
      </div>
    );
  }

  const links = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Banners', href: '/admin/banners', icon: Image },
    { label: 'Orders', href: '/admin/orders', icon: PackageOpen },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Trash Bin', href: '/admin/trash', icon: Trash2 },
  ];

  const isActive = (link: { href: string; exact?: boolean }) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ background: 'var(--bg)', color: 'var(--fg)' }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-full md:w-60 flex-shrink-0 flex flex-col p-6 space-y-6"
        style={{
          background: 'var(--babypink)',
          borderRight: '1px solid var(--grey-mid)',
        }}
      >
        {/* Brand */}
        <div className="space-y-1 pb-4" style={{ borderBottom: '1px solid var(--grey-mid)' }}>
          <h2
            className="text-base font-bold tracking-widest uppercase"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--fg)' }}
          >
            Beads &amp; Beyond
          </h2>
          <p className="text-xxs tracking-wider uppercase" style={{ color: 'var(--grey-muted)' }}>
            Management Portal
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? 'var(--pink-accent)' : 'transparent',
                  color: active ? 'var(--fg)' : 'var(--grey-muted)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: active ? 'var(--fg)' : 'var(--grey-muted)' }}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--grey-mid)' }}>
          <button
            onClick={toggleDark}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80"
            style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem' }}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80"
            style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem' }}
          >
            <LogOut className="w-4 h-4" />
            Back to Store
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
