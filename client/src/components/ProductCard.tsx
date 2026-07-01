'use client';

import React from 'react';
import Link from 'next/link';
import { useApp, Product } from '@/context/AppContext';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart, apiBase } = useApp();
  const isWishlisted = wishlist.includes(product._id);

  const discountedPrice = product.price * (1 - product.discount / 100);

  const imageUrl = product.images && product.images[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `${apiBase.replace('/api/v1', '')}${product.images[0]}`
    : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="group relative bg-white border border-[#EBEBEB] hover:border-[#E5B5B8]/80 transition-all duration-300">
      
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-[#F7F7F7] overflow-hidden">
        <Link href={`/product/${product._id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop';
            }}
          />
        </Link>

        {/* Hover quick add / shopping bag */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="w-full bg-white/95 border border-[#231F20] py-2.5 text-[0.65rem] tracking-[0.1em] uppercase font-sans text-[#231F20] hover:bg-[#231F20] hover:text-white transition-colors duration-250 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock <= 0 ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product._id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 border border-[#EBEBEB] flex items-center justify-center text-[#8E8A8B] hover:text-[#C88C96] hover:bg-white transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#C88C96] text-[#C88C96]' : ''}`} />
        </button>

        {/* Discount tag */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#FCF3F4] border border-[#E5B5B8] text-[#C88C96] text-[0.6rem] font-medium px-2 py-0.5 tracking-wider font-sans">
            {product.discount}% OFF
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 text-center space-y-1">
        <span className="text-[0.62rem] uppercase tracking-widest text-[#C88C96] font-medium font-sans">
          {product.category?.name || 'Jewelry'}
        </span>
        <h3 className="font-serif text-sm text-[#231F20] line-clamp-1 hover:text-[#C88C96] transition-colors">
          <Link href={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        
        {/* Pricing */}
        <div className="flex items-center justify-center gap-2 pt-1 font-sans text-xs">
          {product.discount > 0 ? (
            <>
              <span className="font-medium text-[#C88C96]">
                ₹{discountedPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[#8E8A8B] line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-medium text-[#231F20]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Stock status indicator line */}
        <div className="pt-2 flex justify-center items-center gap-1.5 text-[0.6rem] font-sans">
          {product.stock <= 0 ? (
            <span className="text-red-500 font-medium">Out of Stock</span>
          ) : product.stock < 5 ? (
            <span className="text-amber-600 font-medium">Only {product.stock} Left</span>
          ) : (
            <span className="text-[#8E8A8B] font-light">Available</span>
          )}
        </div>
      </div>
    </div>
  );
}
