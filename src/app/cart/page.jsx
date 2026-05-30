import { Minus, Plus, Trash2, ArrowRight, ArrowUpRight, Loader2, Lock, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import useCart from "@/utils/useCart";
import Header from "@/components/Header";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import useUser from "@/utils/useUser";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const { data: user } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) { window.location.href = "/account/signin?callbackUrl=/cart"; return; }
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, redirectURL: window.location.origin, userId: user.id, userEmail: user.email }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else toast.error(error || "Checkout failed");
    } catch { toast.error("An error occurred"); }
    finally { setIsCheckingOut(false); }
  };

  const subtotal = getTotal();
  const tax = subtotal * 0.07;
  const total = subtotal + tax;
  const qty = items.reduce((s, i) => s + i.quantity, 0);

  const categoryFallbacks = {
    Electronics: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400",
    Clothing:    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=400",
    Home:        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400",
    Accessories: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="flex flex-col items-center justify-center py-40 px-6 text-center" style={{ paddingTop: "calc(56px + 8rem)" }}>
          <p className="text-[9px] font-black tracking-[0.35em] uppercase text-[#888] mb-6">Cart</p>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-black mb-3">
            EMPTY.
          </h1>
          <p className="text-[#888] text-sm mb-12 max-w-xs font-medium">
            Your cart is empty. Add some products you love.
          </p>
          <a
            href="/shop"
            className="group inline-flex items-center gap-3 bg-black text-white px-10 py-5 text-[12px] font-black tracking-[0.25em] uppercase hover:bg-[#222] transition-colors"
          >
            Browse collection
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <Toaster position="bottom-right" />

      {/* Page header */}
      <div style={{ paddingTop: "56px" }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 border-b border-[#f0f0f0] flex items-end justify-between">
          <div>
            <p className="text-[9px] font-black tracking-[0.35em] uppercase text-[#888] mb-3">Checkout</p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              YOUR<br />
              <span className="font-thin text-[#888]">CART</span>
            </h1>
          </div>
          <p className="text-[#888] text-sm font-medium">{qty} item{qty !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* ── Items ── */}
          <div className="space-y-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex gap-5 py-6 border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors px-2 -mx-2"
              >
                {/* Image */}
                <a href={`/product/${item.id}`} className="flex-shrink-0 w-[88px] h-[110px] bg-[#f5f5f5] overflow-hidden">
                  <img
                    src={item.image_url || categoryFallbacks[item.category] || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=400"}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = categoryFallbacks[item.category] || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=400";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </a>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black tracking-[0.25em] uppercase text-[#888] mb-1">{item.category}</p>
                      <h3 className="text-[13px] font-bold text-black leading-snug">{item.name}</h3>
                    </div>
                    <span className="text-[14px] font-black text-black whitespace-nowrap tabular-nums">
                      ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#e5e5e5]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-[#888] hover:bg-[#f5f5f5] hover:text-black transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-9 text-center text-[13px] font-black border-x border-[#e5e5e5]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-[#888] hover:bg-[#f5f5f5] hover:text-black transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#bbb] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-6">
              <a href="/shop" className="text-[11px] font-black tracking-[0.2em] uppercase text-[#888] hover:text-black transition-colors">
                ← Continue shopping
              </a>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="border border-[#e8e8e8] bg-white p-6 sticky top-20">
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#888] mb-5">Order Summary</p>

            <div className="space-y-3 text-[13px] mb-5">
              <div className="flex justify-between">
                <span className="text-[#888]">Subtotal ({qty} item{qty !== 1 ? "s" : ""})</span>
                <span className="font-bold tabular-nums">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">GST (7%)</span>
                <span className="font-bold tabular-nums">₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="border-t border-[#e5e5e5] pt-4 flex justify-between items-center mb-6">
              <span className="font-black text-black tracking-tight">Total</span>
              <span className="text-xl font-black text-black tabular-nums">
                ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="group w-full flex items-center justify-center gap-3 bg-black text-white py-4 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-[#222] transition-all disabled:opacity-50"
            >
              {isCheckingOut ? (
                <><Loader2 size={14} className="animate-spin" /> Processing...</>
              ) : (
                <>
                  Checkout with Stripe
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-[#aaa] font-medium">
              <Lock size={10} />
              Secured by Stripe
            </div>

            {/* Trust badges */}
            <div className="mt-6 pt-5 border-t border-[#f0f0f0] grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5 py-3 bg-[#fafafa] border border-[#f0f0f0]">
                <ShieldCheck size={15} className="text-black" strokeWidth={1.5} />
                <p className="text-[9px] font-black tracking-[0.15em] uppercase text-[#555]">Secure</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 bg-[#fafafa] border border-[#f0f0f0]">
                <Truck size={15} className="text-black" strokeWidth={1.5} />
                <p className="text-[9px] font-black tracking-[0.15em] uppercase text-[#555]">Free Ship</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 bg-[#fafafa] border border-[#f0f0f0]">
                <RotateCcw size={15} className="text-black" strokeWidth={1.5} />
                <p className="text-[9px] font-black tracking-[0.15em] uppercase text-[#555]">Returns</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
