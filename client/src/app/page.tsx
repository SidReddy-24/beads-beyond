'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Gem, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { useApp, Product } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.1 } },
};

const reviews = [
  { name: 'Aria Sharma', rating: 5, comment: 'The Champagne Gold Diamond Earrings are absolute perfection. Minimal yet striking.' },
  { name: 'Vikram Mehta', rating: 5, comment: 'Purchased the solitaire engagement ring. The craftsmanship and certificate are outstanding.' },
  { name: 'Sara Khan', rating: 5, comment: 'Incredible customer support. The resizing of my infinity bracelet was handled so professionally.' },
];

const features = [
  {
    icon: Gem,
    title: 'Master Craftsmanship',
    desc: 'Each piece individually configured and finished by hand by master jewelers with over two decades of heritage.',
  },
  {
    icon: ShieldCheck,
    title: 'Ethically Sourced',
    desc: '100% conflict-free certified gemstones, diamonds, and recycled precious metals — guaranteed.',
  },
  {
    icon: RefreshCw,
    title: 'Lifetime Warranty',
    desc: 'Every purchase protected under our lifetime service warranty including free cleaning and inspection.',
  },
];

const categoryImages = {
  earrings: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
  rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
  bracelets: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  necklaces: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  anklets: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop',
};

export default function Home() {
  const { apiBase } = useApp();
  const [banners, setBanners] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, catRes, prodRes] = await Promise.all([
          fetch(`${apiBase}/banners`),
          fetch(`${apiBase}/categories`),
          fetch(`${apiBase}/products?limit=8`),
        ]);
        const [bData, cData, pData] = await Promise.all([bannerRes.json(), catRes.json(), prodRes.json()]);
        if (bData.success) setBanners(bData.data);
        if (cData.success) setCategories(cData.data);
        if (pData.success) setProducts(pData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiBase]);

  const activeBanner = banners[0] || {
    title: 'Timeless Luxury Collections',
    subtitle: 'Crafted in 18K Champagne Gold & Brilliant Diamonds',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1600&auto=format&fit=crop',
    link: '/shop',
  };

  const getCatImage = (cat: any) => {
    if (cat.image) return cat.image.startsWith('http') ? cat.image : `${apiBase.replace('/api/v1', '')}${cat.image}`;
    const slug = cat.slug || cat.name.toLowerCase();
    return categoryImages[slug as keyof typeof categoryImages] || categoryImages.rings;
  };

  return (
    <div className="w-full" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>

      {/* Hero Header Banner */}
      <section className="relative min-h-[85vh] flex items-center bg-[#FCF3F4]/30 overflow-hidden">
        {/* Background image & subtle overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.image.startsWith('http') ? activeBanner.image : `${apiBase.replace('/api/v1', '')}${activeBanner.image}`}
            alt="Boutique banner"
            className="w-full h-full object-cover opacity-90"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1600&auto=format&fit=crop'; }}
          />
          {/* Subtle light pink/white gradient overlays for clean aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-xl space-y-6"
          >
            {/* Label */}
            <motion.div variants={fadeUp} className="flex items-center gap-2">
              <span className="section-label">Fine Luxury Jewelry</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-serif text-4xl sm:text-6xl font-light leading-[1.1] text-[#231F20]"
            >
              {activeBanner.title.split(' ').slice(0, 2).join(' ')}<br />
              <span className="text-[#C88C96] italic font-medium">
                {activeBanner.title.split(' ').slice(2).join(' ')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-[#8E8A8B] text-sm sm:text-base font-light leading-relaxed max-w-md"
            >
              {activeBanner.subtitle}
            </motion.p>

            {/* Actions */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
              <Link href={activeBanner.link} className="btn-luxury">
                Explore Shop <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/shop?sort=Latest" className="btn-luxury-outline">
                New Arrivals
              </Link>
            </motion.div>

            {/* Trust lines */}
            <motion.div variants={fadeUp} className="flex items-center gap-6 pt-4 text-xxs text-[#8E8A8B] tracking-wider uppercase font-medium">
              {['Free Shipping', 'Lifetime Warranty', 'Ethical Gemstones'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#C88C96]" />
                  <span>{t}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Strip */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="section-label mb-2 block">Collections</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#231F20]">
              Shop by <span className="text-[#C88C96] italic font-medium">Category</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Link href={`/shop?category=${cat._id}`} className="group block text-center">
                  <div className="relative aspect-square overflow-hidden border border-[#EBEBEB] group-hover:border-[#E5B5B8] transition-all duration-300 mb-3 bg-[#FDFBFB]">
                    <img
                      src={getCatImage(cat)}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300'; }}
                    />
                  </div>
                  <p className="font-sans text-xs tracking-wider uppercase font-medium text-[#231F20] group-hover:text-[#C88C96] transition-colors">
                    {cat.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-[#FCF3F4]/20 border-y border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <span className="section-label mb-2 block">New Additions</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#231F20]">
                Our New <span className="text-[#C88C96] italic font-medium">Arrivals</span>
              </h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C88C96] hover:text-[#231F20] transition-colors group">
              View All
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] skeleton" />
                ))
              : products.slice(0, 4).map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* Features Difference */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-label mb-2 block">Our Ethos</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#231F20]">
              The <span className="text-[#C88C96] italic font-medium">Boutique Promise</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="border hover:border-[#E5B5B8] p-8 text-center transition-all duration-300"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}
              >
                <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#FCF3F4] flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-[#C88C96]" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#231F20] mb-3">{f.title}</h3>
                <p className="text-xs text-[#8E8A8B] font-light leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-[#FCF3F4]/20 border-y border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="section-label mb-2 block">Bestsellers</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#231F20]">
              Most <span className="text-[#C88C96] italic font-medium">Loved Pieces</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] skeleton" />
                ))
              : (products.length > 4 ? products.slice(4, 8) : products.slice(0, 4)).map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="section-label mb-2 block">Testimonials</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#231F20]">
              Loved by <span className="text-[#C88C96] italic font-medium">Our Clients</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="border p-8 space-y-4"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-[#C88C96] text-[#C88C96]" />
                  ))}
                </div>
                <p className="text-xs text-[#8E8A8B] font-light leading-relaxed italic">
                  "{r.comment}"
                </p>
                <div className="pt-3 border-t border-[#EBEBEB] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FCF3F4] border border-[#E5B5B8] flex items-center justify-center text-xs font-semibold text-[#C88C96]">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#231F20]">{r.name}</p>
                    <p className="text-[0.6rem] text-[#8E8A8B] uppercase tracking-wider font-sans font-medium">Verified Buyer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram spotted section */}
      <section className="py-16 bg-[#FCF3F4]/10 border-t border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="section-label mb-2 block">Social Gallery</span>
            <h2 className="font-serif text-3xl font-light text-[#231F20]">
              Spotted in <span className="text-[#C88C96] italic font-medium">Beads & Beyond</span>
            </h2>
            <p className="text-xs text-[#8E8A8B] mt-2">Tag us @BeadsAndBeyond to get featured</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600',
              'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600',
              'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600',
              'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600',
            ].map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden border border-[#EBEBEB] group relative">
                <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[#FCF3F4]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-[#FCF3F4] border-t border-[#E5B5B8]/20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto px-4 text-center space-y-5"
        >
          <span className="section-label">Boutique Circle</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#231F20]">
            Sign up for <span className="text-[#C88C96] italic font-medium">Boutique News</span>
          </h2>
          <p className="text-xs text-[#8E8A8B] leading-relaxed max-w-sm mx-auto">
            Stay updated with collection pre-launches, exclusive styling tips, and private sale access.
          </p>

          <form className="flex gap-2 mt-6 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="input-luxury flex-1 py-3 text-xs"
              required
            />
            <button type="submit" className="btn-luxury px-6 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
