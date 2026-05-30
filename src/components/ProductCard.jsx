import { ShoppingCart, Star } from "lucide-react";
import useCart from "@/utils/useCart";
import { toast } from "sonner";

/* size: "normal" | "tall" | "wide" — controls the visual weight in masonry */
export default function ProductCard({ product, size = "normal" }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  const aspectMap = {
    normal: "3/4",
    tall:   "2/3",
    wide:   "4/3",
  };

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden border border-[#f0f0f0] hover:border-[#e0e0e0] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1">
      {/* ── Image ── */}
      <a
        href={`/product/${product.id}`}
        className="relative block overflow-hidden bg-[#f5f5f5] flex-shrink-0"
        style={{ aspectRatio: aspectMap[size] }}
      >
        <img
          src={
            product.image_url ||
            `https://placehold.co/400x500/f5f5f5/888888?text=${encodeURIComponent(product.name)}`
          }
          onError={(e) => {
            e.target.onerror = null;
            // Use multiple varied images per category to avoid duplicates
            const categoryImages = {
              Electronics: [
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800',
              ],
              Clothing: [
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800',
              ],
              Home: [
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800',
              ],
              Accessories: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1611923134239-a5c0f0f8b0b1?auto=format&fit=crop&q=80&w=800',
              ],
            };
            
            const images = categoryImages[product.category] || [
              'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800'
            ];
            
            // Use product ID to consistently pick the same image for the same product
            const index = product.id ? (parseInt(product.id) || 0) % images.length : 0;
            e.target.src = images[index];
          }}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400 flex items-center justify-center">
          <span
            className="text-white text-[11px] font-bold tracking-[0.25em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 border border-white/60 px-5 py-2.5 backdrop-blur-[2px]"
          >
            View details
          </span>
        </div>

        {/* Out of stock */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#888] border border-[#ddd] px-4 py-2 bg-white">
              Sold Out
            </span>
          </div>
        )}

        {/* Low stock */}
        {!outOfStock && product.stock <= 5 && (
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-black tracking-[0.2em] uppercase bg-black text-white px-2.5 py-1">
              Only {product.stock} left
            </span>
          </div>
        )}
      </a>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-[#888]">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star size={9} fill="currentColor" className="text-black" />
            <span className="text-[10px] font-bold text-[#888]">{product.rating || "4.5"}</span>
          </div>
        </div>

        {/* Name */}
        <a href={`/product/${product.id}`} className="block flex-1">
          <h3 className="text-[14px] font-bold text-black leading-snug tracking-tight line-clamp-2 hover:text-[#444] transition-colors">
            {product.name}
          </h3>
        </a>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f5f5f5]">
          <span className="text-[15px] font-black text-black tracking-tight">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <button
            disabled={outOfStock}
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
              toast.success(`${product.name} added to cart`);
            }}
            className="group/btn flex items-center gap-1.5 text-[11px] font-bold tracking-[0.15em] uppercase bg-black text-white px-4 py-2.5 hover:bg-[#222] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={11} strokeWidth={2.5} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
