'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp, Product } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ShopContent() {
  const { apiBase } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('maxPrice') || '150000');
  const [minDiscount, setMinDiscount] = useState(searchParams.get('discount') || '0');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'Latest');

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiBase}/categories`);
        const json = await res.json();
        if (json.success) setCategories(json.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, [apiBase]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (priceRange) params.append('maxPrice', priceRange);
      if (minDiscount && minDiscount !== '0') params.append('discount', minDiscount);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`${apiBase}/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, apiBase]);

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange('150000');
    setMinDiscount('0');
    setSortBy('Latest');
    router.push('/shop');
    setTimeout(() => fetchProducts(), 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      
      {/* Page Header */}
      <div className="mb-12 border-b border-[#EBEBEB] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="section-label mb-2 block">Collections</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#231F20]">
            The Boutique <span className="text-[#C88C96] italic font-medium">Catalog</span>
          </h1>
          <p className="text-xs text-[#8E8A8B] font-light mt-1">Explore our curated luxury handcrafted fine jewelry.</p>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto font-sans">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 border border-[#EBEBEB] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#231F20] hover:bg-[#FCF3F4] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-2 border border-[#EBEBEB] px-3 py-2 bg-transparent text-[#8E8A8B]">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8E8A8B] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-transparent border-none text-[#231F20] font-semibold focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="Latest">Latest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="bestSelling">Best Selling</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="border p-6 sticky top-28 space-y-6" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}>
            <form onSubmit={handleApplyFilters} className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#EBEBEB]">
                <h2 className="section-label flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                </h2>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xxs uppercase tracking-wider text-[#8E8A8B] hover:text-[#C88C96] font-semibold transition"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="section-label">Search Keyword</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jewelry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-luxury pr-8"
                  />
                  <button type="submit" className="absolute right-2.5 top-3 text-[#8E8A8B] hover:text-[#C88C96]">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="section-label">Collection</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-luxury bg-white"
                >
                  <option value="">All Collections</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="section-label">Price Limit</span>
                  <span className="text-xs font-semibold text-[#C88C96]">₹{Number(priceRange).toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="5000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full cursor-pointer accent-[#C88C96]"
                />
                <div className="flex justify-between text-[0.65rem] text-[#8E8A8B]">
                  <span>₹1,000</span>
                  <span>₹150,000+</span>
                </div>
              </div>

              {/* Discount Filter */}
              <div className="space-y-2">
                <label className="section-label">Offers</label>
                <select
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(e.target.value)}
                  className="input-luxury bg-white"
                >
                  <option value="0">Show all items</option>
                  <option value="5">5% discount & more</option>
                  <option value="10">10% discount & more</option>
                  <option value="20">20% discount & more</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full btn-luxury justify-center py-3"
              >
                Apply Selection
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile Filter Overlay */}
        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="relative border-l w-80 h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}
              >
                <div className="space-y-6 flex-1">
                  <div className="flex justify-between items-center pb-4 border-b border-[#EBEBEB]">
                    <h2 className="section-label flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                    </h2>
                    <button onClick={() => setShowMobileFilters(false)} className="text-[#8E8A8B] hover:text-[#C88C96]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleApplyFilters} className="space-y-6">
                    <div className="space-y-2">
                      <label className="section-label">Search Keyword</label>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="section-label">Collection</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-luxury bg-white"
                      >
                        <option value="">All Collections</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="section-label">Price Limit</span>
                        <span className="text-[#C88C96]">₹{Number(priceRange).toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="150000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full accent-[#C88C96]"
                      />
                    </div>
                    <button type="submit" className="w-full btn-luxury justify-center py-3">
                      Apply Filters
                    </button>
                  </form>
                </div>
                
                <button
                  type="button"
                  onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
                  className="w-full text-center py-3 text-xs text-[#8E8A8B] hover:text-[#C88C96] uppercase tracking-wider font-semibold border border-[#EBEBEB]"
                >
                  Clear All
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Grid section */}
        <div className="flex-1 space-y-8">
          <div className="flex justify-between items-center text-xs text-[#8E8A8B] border-b border-[#EBEBEB] pb-3">
            <span>Showing {products.length} exquisite jewelry pieces</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="aspect-[4/5] skeleton" key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard product={p} key={p._id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-[#EBEBEB]">
              <p className="text-[#8E8A8B] font-light text-sm">No jewelry matches your current criteria.</p>
              <button
                onClick={handleResetFilters}
                className="mt-5 btn-luxury-outline px-6 py-2.5"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#C88C96] font-serif text-xl">Loading boutique...</div>}>
      <ShopContent />
    </Suspense>
  );
}
