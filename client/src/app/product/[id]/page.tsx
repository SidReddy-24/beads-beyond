'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp, Product } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { apiBase, addToCart, wishlist, toggleWishlist, token, user } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Image
  const [selectedImage, setSelectedImage] = useState(0);

  // Image Zoom Position
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  const isWishlisted = product ? wishlist.includes(product._id) : false;

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/products/${id}`);
        const json = await res.json();
        if (json.success) {
          setProduct(json.data);
          // Fetch similar products in same category
          const simRes = await fetch(`${apiBase}/products?category=${json.data.category._id}&limit=4`);
          const simJson = await simRes.json();
          if (simJson.success) {
            setSimilarProducts(simJson.data.filter((p: Product) => p._id !== json.data._id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${apiBase}/reviews/${id}`);
        const json = await res.json();
        if (json.success) setReviews(json.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id, apiBase]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 1);
      router.push('/cart');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${apiBase}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product: id, rating, comment })
      });
      const json = await res.json();
      if (json.success) {
        setComment('');
        setReviewMessage('Review submitted successfully!');
        // Refresh reviews
        setReviews([...reviews, { ...json.data, user: { name: user.name } }]);
      } else {
        setReviewMessage(json.message || 'Could not submit review.');
      }
    } catch (err) {
      setReviewMessage('Error submitting review.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-96 w-full" style={{ backgroundColor: 'var(--grey-mid)' }} />
          <div className="h-8 w-2/3 mx-auto" style={{ backgroundColor: 'var(--grey-light)' }} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <h2 className="text-xl" style={{ color: 'var(--fg)' }}>Jewelry piece not found.</h2>
        <button onClick={() => router.push('/shop')} className="mt-4 font-semibold uppercase btn-luxury-outline px-6 py-2 mt-6">
          Back to boutique
        </button>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - product.discount / 100);

  // Absolute Image paths
  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.startsWith('http') ? img : `${apiBase.replace('/api/v1', '')}${img}`)
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Grid / Zoom */}
        <div className="space-y-4">
          <div
            className="relative aspect-square overflow-hidden cursor-zoom-in"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--grey-mid)' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-100"
              style={
                isZooming
                  ? {
                      transform: 'scale(1.8)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : undefined
              }
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600';
              }}
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-rosegold text-white text-xxs font-semibold px-2.5 py-1.5 rounded">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 border-2 overflow-hidden flex-shrink-0`}
                  style={{ borderColor: selectedImage === idx ? '#D4AF37' : 'var(--grey-mid)' }}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Specs */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--rosegold)' }}>
              {product.category?.name || 'Jewelry'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium mt-1 leading-tight" style={{ color: 'var(--fg)' }}>
              {product.name}
            </h1>
            <p className="text-xs mt-1 font-light" style={{ color: 'var(--grey-muted)' }}>SKU: {product.sku}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex" style={{ color: '#D4AF37' }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className="w-4 h-4" style={{ fill: '#D4AF37' }} />
              ))}
            </div>
            <span className="text-xs font-light" style={{ color: 'var(--grey-muted)' }}>({reviews.length} customer reviews)</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 py-2 border-y" style={{ borderColor: 'var(--grey-mid)' }}>
            {product.discount > 0 ? (
              <>
                <span className="text-2xl font-semibold" style={{ color: '#D4AF37' }}>
                  ₹{discountedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-base line-through" style={{ color: 'var(--grey-muted)' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>The Story</h4>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg)' }}>{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map((tag, i) => (
                <span key={i} className="text-xxs uppercase tracking-wider px-2.5 py-1" style={{ backgroundColor: 'var(--grey-light)', color: 'var(--grey-muted)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <div className="flex gap-4">
              <button
                onClick={() => addToCart(product, 1)}
                disabled={product.stock <= 0}
                className="flex-1 py-4 text-xs font-semibold uppercase tracking-wider transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2 border hover:bg-[#D4AF37] hover:text-white"
                style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-4 gold-gradient text-xs font-semibold uppercase tracking-wider transition duration-300 disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            <button
              onClick={() => toggleWishlist(product._id)}
              className="w-full py-3 text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--grey-light)', color: 'var(--fg)' }}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#C88C96] text-[#C88C96]' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Shipping highlight */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t text-center text-xxs tracking-wider uppercase font-semibold" style={{ borderColor: 'var(--grey-mid)', color: 'var(--grey-muted)' }}>
            <div className="space-y-1 flex flex-col items-center">
              <Truck className="w-5 h-5 mb-1" style={{ color: '#D4AF37' }} />
              <span>Free Delivery</span>
            </div>
            <div className="space-y-1 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 mb-1" style={{ color: '#D4AF37' }} />
              <span>Certified Fine</span>
            </div>
            <div className="space-y-1 flex flex-col items-center">
              <RotateCcw className="w-5 h-5 mb-1" style={{ color: '#D4AF37' }} />
              <span>15-Day Return</span>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20 border-t pt-16" style={{ borderColor: 'var(--grey-mid)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review form */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif" style={{ color: 'var(--fg)' }}>Add a Review</h3>
            {token ? (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-stone-500">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full text-sm border border-stone-200 rounded p-2.5 bg-white focus:outline-none"
                  >
                    <option value="5">5 Stars — Excellent</option>
                    <option value="4">4 Stars — Good</option>
                    <option value="3">3 Stars — Average</option>
                    <option value="2">2 Stars — Poor</option>
                    <option value="1">1 Star — Terrible</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-stone-500">Comment</label>
                  <textarea
                    rows={4}
                    placeholder="Share your thoughts about this jewelry piece..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded p-3 focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <button type="submit" className="px-6 py-3 gold-gradient text-white text-xs uppercase tracking-wider font-semibold rounded hover:opacity-90">
                  Submit Review
                </button>
                {reviewMessage && <p className="text-xs text-gold mt-2 font-medium">{reviewMessage}</p>}
              </form>
            ) : (
              <div className="p-6 bg-stone-100 rounded text-center border border-stone-200">
                <p className="text-sm font-light text-stone-500">You must be signed in to submit a review.</p>
                <button onClick={() => router.push('/login')} className="mt-3 text-xs uppercase font-semibold text-gold underline">
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* List of reviews */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-serif" style={{ color: 'var(--fg)' }}>Customer Feedback</h3>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((rev, i) => (
                  <div key={i} className="border-b border-ivory pb-6 font-poppins">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-dark">{rev.user?.name || 'Customer'}</h4>
                      <div className="flex text-gold">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-light text-stone-600 italic leading-relaxed">"{rev.comment}"</p>
                    <span className="text-stone-400 text-xxs font-light mt-2 block">
                      Posted on {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400 font-light">Be the first to review this jewelry piece.</p>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-20 border-t border-ivory pt-16">
          <h3 className="text-2xl font-playfair text-dark mb-8">You May Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {similarProducts.map((p) => (
              <ProductCard product={p} key={p._id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
