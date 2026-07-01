'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { IndianRupee, ShoppingCart, Gem, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { token, apiBase } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiBase}/dashboard/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
            style={{ borderColor: 'var(--pink-accent)', borderTopColor: 'transparent' }}
          />
          <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif' }}>
            Loading analytics…
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      accent: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      accent: '#D4AF37',
      bg: 'rgba(212, 175, 55, 0.08)',
    },
    {
      label: 'Active Products',
      value: stats?.totalProducts ?? 0,
      icon: Gem,
      accent: 'var(--rosegold)',
      bg: 'rgba(200, 140, 150, 0.08)',
    },
    {
      label: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      accent: '#7C3AED',
      bg: 'rgba(124, 58, 237, 0.08)',
    },
  ];

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
          Dashboard Overview
        </h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
          Live metrics, sales growth, and recent customer checkouts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-6 rounded-xl"
              style={{
                background: 'var(--babypink)',
                border: '1px solid var(--grey-mid)',
              }}
            >
              <div className="space-y-1">
                <span
                  className="text-xxs uppercase tracking-widest"
                  style={{ color: 'var(--grey-muted)' }}
                >
                  {card.label}
                </span>
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--fg)', fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {card.value}
                </p>
              </div>
              <div
                className="p-3.5 rounded-full flex-shrink-0"
                style={{ background: card.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Revenue Bars */}
        <div
          className="lg:col-span-2 p-6 rounded-xl space-y-5"
          style={{ background: 'var(--babypink)', border: '1px solid var(--grey-mid)' }}
        >
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--fg)' }}>
            Monthly Revenue
          </h3>
          <div className="space-y-3">
            {stats?.monthlySales?.length > 0 ? stats.monthlySales.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="w-8 text-xxs font-semibold"
                  style={{ color: 'var(--grey-muted)' }}
                >
                  {m.month}
                </span>
                <div
                  className="flex-1 rounded-full h-2 overflow-hidden"
                  style={{ background: 'var(--grey-mid)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((m.revenue / (stats.totalRevenue || 1)) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, var(--pink-accent), var(--rosegold))',
                    }}
                  />
                </div>
                <span
                  className="w-20 text-right text-xs font-semibold"
                  style={{ color: 'var(--fg)' }}
                >
                  ₹{m.revenue.toLocaleString('en-IN')}
                </span>
              </div>
            )) : (
              <p className="text-xs" style={{ color: 'var(--grey-muted)' }}>No monthly data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div
          className="p-6 rounded-xl space-y-5"
          style={{ background: 'var(--babypink)', border: '1px solid var(--grey-mid)' }}
        >
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--fg)' }}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((ord: any) => (
              <div
                key={ord._id}
                className="flex justify-between items-center text-xs pb-3"
                style={{ borderBottom: '1px solid var(--grey-mid)' }}
              >
                <div>
                  <p className="font-semibold truncate max-w-[120px]" style={{ color: 'var(--fg)' }}>
                    {ord.user?.name || 'Guest'}
                  </p>
                  <p className="text-xxs mt-0.5" style={{ color: 'var(--grey-muted)' }}>
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: 'var(--rosegold)' }}>
                    ₹{ord.payableAmount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xxs uppercase" style={{ color: 'var(--grey-muted)' }}>
                    {ord.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-xs" style={{ color: 'var(--grey-muted)' }}>No recent orders.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
