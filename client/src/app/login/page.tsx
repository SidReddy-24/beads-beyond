'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Gem, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginContent() {
  const { login, apiBase } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister ? `${apiBase}/auth/register` : `${apiBase}/auth/login`;
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        login(json.token, json.user);
        router.push(redirect);
      } else {
        setError(json.message || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-white dark:bg-[#161214] flex items-center justify-center px-4 py-16 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Luxury Card Container */}
        <div className="bg-white dark:bg-[#1E1A1C] border border-[#EBEBEB] dark:border-[#2A2326] p-8 sm:p-10 shadow-sm">
          
          {/* Logo Mark Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-11 h-11 rounded-full bg-[#FCF3F4] dark:bg-[#2C1F22] border border-[#E5B5B8] dark:border-[#36282B] flex items-center justify-center mb-4">
              <Gem className="w-5 h-5 text-[#C88C96]" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#231F20] dark:text-[#FAF6F7] text-center">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-[#8E8A8B] mt-2 text-center font-light leading-relaxed">
              {isRegister
                ? 'Register with Beads & Beyond to access private collections.'
                : 'Sign in to access your boutique client profile.'}
            </p>
          </div>

          {/* Alert Message for invalid credentials */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-3 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10 text-red-650 dark:text-red-400 text-xs text-center font-sans font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="section-label block text-[0.62rem] text-[#8E8A8B]">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-luxury"
                  placeholder="Your full name"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="section-label block text-[0.62rem] text-[#8E8A8B]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxury"
                placeholder="you@beadsandbeyond.com"
              />
            </div>

            <div className="space-y-1">
              <label className="section-label block text-[0.62rem] text-[#8E8A8B]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8A8B] hover:text-[#C88C96] transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-luxury w-full justify-center mt-6 py-3.5 disabled:opacity-50 font-sans"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider line */}
          <div className="h-px bg-[#EBEBEB] dark:bg-[#2A2326] my-6" />

          {/* Toggle form button */}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="w-full text-center text-xs text-[#8E8A8B] hover:text-[#C88C96] transition-colors duration-200 tracking-wide font-sans"
          >
            {isRegister ? 'Already have an account? ' : 'New here? '}
            <span className="text-[#C88C96] font-semibold uppercase tracking-wider">
              {isRegister ? 'Sign In' : 'Create Account'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#C88C96] font-serif text-xl">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
