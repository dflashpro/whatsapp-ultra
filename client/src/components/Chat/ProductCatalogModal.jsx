import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { X, ShoppingBag, Plus, Send, Tag, Package } from 'lucide-react';

const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Premium T-Shirt', price: 1500, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80', category: 'Clothing' },
  { id: 2, name: 'Wireless Earbuds', price: 8900, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80', category: 'Electronics' },
  { id: 3, name: 'Running Shoes', price: 5500, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', category: 'Sports' },
  { id: 4, name: 'Coffee Mug', price: 750, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&q=80', category: 'Home' },
  { id: 5, name: 'Notebook Set', price: 1200, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=80', category: 'Stationery' },
  { id: 6, name: 'Phone Stand', price: 2000, image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&q=80', category: 'Accessories' },
];

export const ProductCatalogModal = ({ onClose }) => {
  const { sendMessage } = useSocket();
  const { showToast } = useAuth();
  const [selected, setSelected] = useState(null);

  const shareProduct = (product) => {
    sendMessage({
      type: 'text',
      text: `🛍️ *${product.name}*\n💰 LKR ${product.price.toLocaleString()}\n📦 Category: ${product.category}\n\n_Sent via WhatsApp Ultra Business Catalog_`
    });
    showToast(`Product "${product.name}" shared! 🛍️`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-modal rounded-3xl overflow-hidden shadow-2xl text-[#e9edef] max-h-[85vh] flex flex-col">
        <div className="h-14 px-5 glass-header border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-400" />
            <div>
              <h2 className="text-xs font-bold">Product Catalog</h2>
              <p className="text-[10px] text-[#8696a0]">WhatsApp Ultra Business</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-[#8696a0]"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3">
          {SAMPLE_PRODUCTS.map(product => (
            <div key={product.id}
              onClick={() => setSelected(selected?.id === product.id ? null : product)}
              className={`rounded-2xl overflow-hidden border cursor-pointer transition-all ${selected?.id === product.id ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/10 hover:border-white/20'}`}
            >
              <img src={product.image} alt={product.name} className="w-full h-24 object-cover" />
              <div className="p-2.5">
                <p className="text-[11px] font-bold truncate">{product.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#00a884] font-bold">LKR {product.price.toLocaleString()}</span>
                  <span className="text-[9px] text-[#8696a0] px-1.5 py-0.5 bg-white/5 rounded-full">{product.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="p-3 border-t border-white/5 shrink-0">
            <button onClick={() => shareProduct(selected)} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2">
              <Send size={15} /> Share "{selected.name}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
