import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

/* ── Floating/sticky filter bar ── */
function FilterBar({ category, setCategory, priceRange, setPriceRange, sort, setSort, count, sticky }) {
  const categories = ["All", "Home", "Accessories", "Clothing"];

  return (
    <div
      className={`transition-all duration-300 ${
        sticky
          ? "fixed top-14 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5]/80 shadow-sm"
          : "relative bg-white border-b border-[#f5f5f5]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Sort selection */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none border border-[#eaeaea] bg-white py-2.5 pl-4 pr-9 text-[11px] text-neutral-600 font-bold tracking-widest uppercase focus:border-black focus:text-black focus:outline-none cursor-pointer hover:border-black hover:text-black transition-colors rounded-none outline-none"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>

          {/* Price range filter */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="appearance-none border border-[#eaeaea] bg-white py-2.5 pl-4 pr-9 text-[11px] text-neutral-600 font-bold tracking-widest uppercase focus:border-black focus:text-black focus:outline-none cursor-pointer hover:border-black hover:text-black transition-colors rounded-none outline-none"
            >
              <option value="">Price Range</option>
              <option value="under-1000">Under ₹1K</option>
              <option value="1000-5000">₹1K – ₹5K</option>
              <option value="over-5000">Over ₹5K</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>

          {/* Item count */}
          <span className="ml-auto text-[10px] text-[#999] font-black tracking-[0.2em] uppercase hidden xl:block select-none">
            {count} item{count !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sort, setSort] = useState("");
  const [filterSticky, setFilterSticky] = useState(false);
  const filterRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, []);

  // Make filter bar sticky when it scrolls to top of viewport
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setFilterSticky(!entry.isIntersecting),
      { rootMargin: "-56px 0px 0px 0px" }
    );
    if (sentinelRef.current) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category, priceRange],
    queryFn: async () => {
      let url = `/api/products?category=${encodeURIComponent(category)}`;
      if (priceRange === "under-1000") url += "&maxPrice=1000";
      if (priceRange === "1000-5000") url += "&minPrice=1000&maxPrice=5000";
      if (priceRange === "over-5000") url += "&minPrice=5000";
      const res = await fetch(url);
      return res.json();
    },
  });

  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans relative">
      {/* Ambient Grain Overlay */}
      <div className="grain fixed inset-0 pointer-events-none z-[9999]" />

      <Header />

      {/* ── Page Header ── */}
      <div className="pt-14">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-[#f5f5f5]">
          <div>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#888] mb-3 select-none">Collection</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.88] text-black uppercase flex flex-col">
              <span>SHOP</span>
              <span className="font-light text-neutral-400 mt-1 select-none">
                {category || "ALL"}
              </span>
            </h1>
          </div>
          <p className="text-[13px] text-[#666] leading-relaxed max-w-xs font-normal">
            Every item in our collection is hand-selected for its material quality, timeless aesthetic, and structural longevity.
          </p>
        </div>

        {/* Sentinel for sticky detection */}
        <div ref={sentinelRef} />

        {/* Filter bar */}
        <div ref={filterRef}>
          <FilterBar
            category={category} setCategory={setCategory}
            priceRange={priceRange} setPriceRange={setPriceRange}
            sort={sort} setSort={setSort}
            count={sorted.length}
            sticky={filterSticky}
          />
        </div>

        {/* Spacer when sticky */}
        {filterSticky && <div className="h-[65px]" />}
      </div>

      {/* ── Product Grid ── */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-12 pb-28">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-4 select-none">
            <Loader2 size={24} className="animate-spin text-black" strokeWidth={1.5} />
            <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#888]">Loading Collection...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-36 gap-4 border border-dashed border-[#e5e5e5] px-6 select-none bg-[#fafafa]">
            <p className="text-4xl font-black tracking-tighter text-[#eaeaea]">EMPTY</p>
            <p className="text-[13px] text-[#888] font-medium">No premium products match your current filters.</p>
            <button
              onClick={() => { setCategory(""); setPriceRange(""); setSort(""); }}
              className="text-[11px] font-black tracking-[0.2em] uppercase bg-black text-white px-7 py-3.5 hover:bg-[#222] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16 pb-20">
            {sorted.map((product, i) => {
              // Stagger alternating cards on desktop to deliver an expensive floating lookbook feel
              const staggerClass = i % 2 === 1 ? "lg:translate-y-8" : "";

              return (
                <div
                  key={product.id}
                  className={`transition-all duration-500 min-h-0 ${staggerClass}`}
                >
                  <ProductCard product={product} size="normal" />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer Strip ── */}
      <div className="border-t border-[#f5f5f5] bg-white py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#888]">
            © 2026 STORECORE ESSENTIALS. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase text-[#bbb]">
            PREMIUM DESIGN GOODS
          </p>
        </div>
      </div>
    </div>
  );
}
