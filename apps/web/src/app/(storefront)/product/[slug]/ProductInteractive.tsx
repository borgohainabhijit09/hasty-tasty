"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function ProductInteractive({ product }: { product: any }) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.basePrice || product.price,
      quantity: quantity,
      image: product.images?.[0]?.url || "/images/hero-cake.png",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
      {/* Quantity Selector */}
      <div className="flex items-center border border-[#EBE3D5] rounded-lg h-12 w-full sm:w-auto bg-white">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-[#3A1E14] transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="w-12 text-center text-[#3A1E14] font-medium text-[15px]">
          {quantity}
        </span>
        <button 
          onClick={() => setQuantity(quantity + 1)}
          className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-[#3A1E14] transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        className="flex-1 w-full bg-[#4A171E] hover:bg-[#330F13] text-white font-medium text-[15px] h-12 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#4A171E]/20"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </motion.button>
    </div>
  );
}
