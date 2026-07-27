"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Heart, ShieldCheck, Truck, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("/images/hero-cake.png");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0].url);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center bg-[#FAF8F5] min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89F5F]"></div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center bg-[#FAF8F5] min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-[#3A1E14] mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find the product you're looking for.</p>
        <Link href="/shop" className="bg-[#4A171E] text-white px-6 py-3 rounded-lg hover:bg-[#330F13] transition-colors">
          Return to Shop
        </Link>
      </main>
    );
  }

  // Find applicable B2B pricing tier based on quantity
  let currentPrice = product.basePrice || product.price;
  let activeTierLabel = "";
  
  if (product.pricingTiers && product.pricingTiers.length > 0) {
    const sortedTiers = [...product.pricingTiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQty) {
        currentPrice = tier.price;
        activeTierLabel = `Bulk Discount Applied (₹${tier.price}/unit)`;
        break;
      }
    }
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.basePrice || product.price, // Cart will recalculate
      quantity: quantity,
      image: product.images?.[0]?.url || "/images/hero-cake.png",
      pricingTiers: product.pricingTiers || []
    } as any);
  };

  return (
    <main className="flex-grow flex flex-col bg-[#FAF8F5] font-sans pb-16">
      <div className="max-w-[1260px] mx-auto px-4 md:px-8 py-8 w-full">
        
        {/* Breadcrumb */}
        <div className="text-[12px] text-gray-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#C89F5F] transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-[#C89F5F] transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>&gt;</span>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#C89F5F] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>&gt;</span>
          <span className="text-[#C89F5F] font-medium">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-[#F0EBE1] flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* Images Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F7F4F0] border border-gray-100">
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                {product.images.map((img: any, idx: number) => (
                  <button 
                    key={img.id || idx}
                    onClick={() => setMainImage(img.url)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img.url ? 'border-[#C89F5F]' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <Image src={img.url} alt={`${product.name} - Image ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 flex flex-col">
            {product.category && (
              <span className="text-[#C89F5F] text-[11px] font-bold uppercase tracking-wider mb-2 block">
                {product.category.name}
              </span>
            )}
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-[#3A1E14] mb-2 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} size={14} className="text-[#C89F5F] fill-[#C89F5F]" />
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">(New)</span>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-[#3A1E14] flex items-baseline gap-3">
                ₹{currentPrice}
                {currentPrice !== (product.basePrice || product.price) && (
                  <span className="text-lg text-gray-400 line-through">₹{product.basePrice || product.price}</span>
                )}
              </p>
              {activeTierLabel && (
                <p className="text-[#C89F5F] text-sm font-medium mt-1">{activeTierLabel}</p>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8 border-b border-gray-100 pb-8">
              {product.description || "A delicious treat made with the finest ingredients, perfect for any occasion."}
            </p>

            {/* B2B Pricing Tiers Display */}
            {product.pricingTiers && product.pricingTiers.length > 0 && (
              <div className="mb-8 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h4 className="text-sm font-bold text-[#3A1E14] mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#C89F5F]" /> B2B Bulk Pricing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-orange-100/50 shadow-sm text-sm">
                    <span className="text-gray-600">1 - {product.pricingTiers[0]?.minQty - 1} units</span>
                    <span className="font-bold text-[#3A1E14]">₹{product.basePrice || product.price}</span>
                  </div>
                  {[...product.pricingTiers].sort((a,b) => a.minQty - b.minQty).map((tier: any, idx: number) => (
                    <div key={idx} className={`flex justify-between items-center bg-white px-3 py-2 rounded-lg border shadow-sm text-sm ${quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty) ? 'border-[#C89F5F] ring-1 ring-[#C89F5F]/20' : 'border-orange-100/50'}`}>
                      <span className="text-gray-600">
                        {tier.minQty} {tier.maxQty ? `- ${tier.maxQty}` : '+'} units
                      </span>
                      <span className="font-bold text-[#C89F5F]">₹{tier.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-lg h-12 w-32 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 h-full flex items-center justify-center text-gray-500 hover:text-[#C89F5F] transition-colors"
                >
                  -
                </button>
                <input 
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center font-semibold text-[#3A1E14] w-full bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 h-full flex items-center justify-center text-gray-500 hover:text-[#C89F5F] transition-colors"
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-[#4A171E] hover:bg-[#330F13] text-white font-medium tracking-wide text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <ShoppingCart size={16} /> Add to Cart — ₹{currentPrice * quantity}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#C89F5F]">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#3A1E14]">Fast Delivery</p>
                  <p className="text-[10px] text-gray-500">Fresh at your door</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#C89F5F]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#3A1E14]">Premium Quality</p>
                  <p className="text-[10px] text-gray-500">Finest ingredients</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
