import React from 'react';
import Link from 'next/link';
import { Gem, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  collections: [
    { label: 'Rings & Bands', href: '/shop?category=rings' },
    { label: 'Earrings', href: '/shop?category=earrings' },
    { label: 'Bracelets', href: '/shop?category=bracelets' },
    { label: 'Necklaces', href: '/shop?category=necklaces' },
    { label: 'Anklets', href: '/shop?category=anklets' },
  ],
  care: [
    { label: 'Shipping & Returns', href: '#' },
    { label: 'Jewelry Care Guide', href: '#' },
    { label: 'Size Guide', href: '#' },
    { label: 'Contact Support', href: '#' },
    { label: 'FAQs', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#EBEBEB] text-[#231F20] font-sans">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 rounded-full bg-[#FCF3F4] border border-[#E5B5B8] flex items-center justify-center">
                  <Gem className="w-4 h-4 text-[#C88C96]" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-lg font-semibold tracking-[0.12em] text-[#231F20]">BEADS</span>
                  <span className="text-[0.55rem] tracking-[0.35em] uppercase text-[#C88C96] -mt-0.5">& BEYOND</span>
                </div>
              </Link>
              <p className="text-xs text-[#8E8A8B] font-light leading-relaxed max-w-sm">
                Exquisite, modern British fine jewelry design. Lovingly handcrafted engagement rings, necklaces, and gemstones.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {/* Instagram */}
              <a href="#" className="w-9 h-9 flex items-center justify-center border border-[#EBEBEB] rounded-full text-[#8E8A8B] hover:text-[#C88C96] hover:border-[#C88C96] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="w-9 h-9 flex items-center justify-center border border-[#EBEBEB] rounded-full text-[#8E8A8B] hover:text-[#C88C96] hover:border-[#C88C96] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="w-9 h-9 flex items-center justify-center border border-[#EBEBEB] rounded-full text-[#8E8A8B] hover:text-[#C88C96] hover:border-[#C88C96] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="section-label mb-5">Collections</h4>
            <ul className="space-y-3">
              {footerLinks.collections.map((l, idx) => (
                <li key={idx}>
                  <Link href={l.href} className="text-xs text-[#8E8A8B] hover:text-[#C88C96] transition-colors duration-200 font-light">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="section-label mb-5">Customer Care</h4>
            <ul className="space-y-3">
              {footerLinks.care.map((l, idx) => (
                <li key={idx}>
                  <Link href={l.href} className="text-xs text-[#8E8A8B] hover:text-[#C88C96] transition-colors duration-200 font-light">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutique Boutique */}
          <div className="space-y-4">
            <h4 className="section-label mb-5">Boutique</h4>
            <div className="space-y-3 text-xs text-[#8E8A8B]">
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-[#C88C96] shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">
                  102, Gold Crest Boulevard,<br />Champagne Hills, Mumbai
                </span>
              </div>
              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-[#C88C96] shrink-0" />
                <a href="mailto:info@beadsandbeyond.com" className="hover:text-[#C88C96] transition-colors font-light">info@beadsandbeyond.com</a>
              </div>
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-[#C88C96] shrink-0" />
                <span className="font-light">+91 22 8765 4321</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delicate divider */}
        <div className="h-px bg-[#EBEBEB] mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#8E8A8B] font-light">
          <p>
            © {new Date().getFullYear()} Beads & Beyond. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
              <Link key={t} href="#" className="hover:text-[#C88C96] transition-colors duration-200">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
