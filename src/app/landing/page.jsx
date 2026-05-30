import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ArrowDown, Send } from "lucide-react";
import useUser from "@/utils/useUser";
import Header from "@/components/Header";

/* ─── Premium Marquee banner ─── */
function MarqueeBanner({ dark = false, reverse = false }) {
  const items = [
    "FREE SHIPPING WORLDWIDE",
    "NEW ARRIVALS EVERY WEEK",
    "CURATED DESIGN GOODS",
    "SECURE STRIPE CHECKOUT",
    "EXCLUSIVE MEMBER REWARDS",
    "QUALITY OVER QUANTITY",
  ];
  return (
    <div className={`overflow-hidden py-4 border-y ${dark ? "bg-[#0c0c0c] border-[#1e1e1e]" : "bg-[#f9f9f9] border-[#eeeeee]"}`}>
      <div
        className="inline-flex gap-16 whitespace-nowrap"
        style={{
          animation: `marquee ${reverse ? "35s" : "25s"} linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-4 text-[10px] font-black tracking-[0.25em] uppercase ${dark ? "text-[#555] hover:text-white" : "text-[#999] hover:text-black"} transition-colors duration-300`}
          >
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${dark ? "bg-[#333]" : "bg-[#ddd]"}`} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat counter with smooth cubic-bezier easing ─── */
function Stat({ n, suffix, label }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const t0 = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - t0) / 1800, 1);
        // smooth ease-out-cubic
        setVal(Math.floor((1 - Math.pow(1 - p, 3)) * n));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [n]);
  return (
    <div ref={ref} className="flex-1 text-center border-r border-[#1a1a1a] last:border-r-0 py-8 px-4">
      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">{val.toLocaleString()}{suffix}</div>
      <p className="text-[9px] text-[#444] tracking-[0.25em] uppercase mt-2 font-bold select-none">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const { data: user } = useUser();

  // Premium, highly curated minimal monochrome Unsplash image selections
  const categories = [
    {
      name: "Electronics",
      count: 4,
      sub: "Minimal mechanical keyboards, high-fidelity wireless studio headphones, and industrial desk stands.",
      img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
      num: "01",
      height: "lg:translate-y-6 aspect-[4/5]", // Staggered masonry effect
    },
    {
      name: "Home",
      count: 5,
      sub: "Sculptural designer pedestal lamps, matte black stoneware mugs, and textured organic waffle throws.",
      img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800",
      num: "02",
      height: "aspect-[3/4]",
    },
    {
      name: "Accessories",
      count: 4,
      sub: "Polished carbon-monolith watches, top-grain hand-stitched leather wallets, and geometric modular bags.",
      img: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&q=80&w=800",
      num: "03",
      height: "lg:-translate-y-6 aspect-[4/5]", // Staggered masonry effect
    },
    {
      name: "Clothing",
      count: 2,
      sub: "Heavyweight drop-shoulder cotton hoodies, structured double-breasted coats, and high-density raw denim.",
      img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
      num: "04",
      height: "lg:translate-y-3 aspect-[3/4]",
    },
  ];

  return (
    <div className="bg-white text-black min-h-screen overflow-x-hidden font-sans relative">
      {/* Premium Ambient Grain Overlay */}
      <div className="grain fixed inset-0 pointer-events-none z-[9999]" />

      {/* Render Sticky Navbar Header */}
      <Header />

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen pt-14 bg-white flex flex-col lg:flex-row border-b border-[#f5f5f5]">
        {/* Left Side: Copy & Branding */}
        <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 border-r border-[#f0f0f0]">
          {/* Top tagline */}
          <p className="clip-reveal text-[10px] font-black tracking-[0.35em] uppercase text-[#888] mb-12 lg:mb-0">
            Est. 2026 — Premium Curated Collection
          </p>

          {/* Large Editorial Headline */}
          <div className="my-auto py-8">
            <div className="overflow-hidden leading-none mb-1">
              <h1 className="clip-reveal text-[clamp(3.5rem,8vw,7.5rem)] font-black tracking-tighter text-black uppercase leading-[0.85]">
                THE
              </h1>
            </div>
            <div className="overflow-hidden leading-none mb-1">
              <h1 className="clip-reveal-delay-1 text-[clamp(3.5rem,8vw,7.5rem)] font-thin tracking-tighter text-[#c5c5c5] uppercase leading-[0.85] italic">
                NEW
              </h1>
            </div>
            <div className="overflow-hidden leading-none mb-1">
              <h1 className="clip-reveal-delay-2 text-[clamp(3.5rem,8vw,7.5rem)] font-black tracking-tighter text-black uppercase leading-[0.85]">
                STORE
              </h1>
            </div>
            <div className="overflow-hidden leading-none">
              <h1 className="clip-reveal-delay-3 text-[clamp(3.5rem,8vw,7.5rem)] font-thin tracking-tighter text-[#a5a5a5] uppercase leading-[0.85] italic">
                CORE.
              </h1>
            </div>
          </div>

          {/* Subtext and Interactive CTA */}
          <div className="slide-up-3 flex flex-col sm:flex-row sm:items-end gap-8">
            <p className="text-[13px] text-[#666] leading-relaxed max-w-[280px] font-normal">
              A curated catalog of premium everyday essentials — designed with intention, crafted for longevity, and refined for the detail-oriented.
            </p>
            <a
              href={user ? "/shop" : "/account/signup"}
              className="group inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-[12px] font-black tracking-[0.25em] uppercase hover:bg-neutral-850 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] whitespace-nowrap"
            >
              {user ? "Browse Catalog" : "Start Journey"}
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Right Side: Framed Lookbook Image (Visible on mobile too, framed to prevent cut-off) */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-20 bg-[#fafafa]">
          <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-[80%] max-h-[600px] bg-white border border-[#eaeaea] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.04)] group select-none transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
            <div className="relative w-full h-full overflow-hidden bg-neutral-50 border border-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=85&w=1200"
                alt="StoreCore collection lookbook"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
              {/* Grayscale overlay that fades on hover */}
              <div className="absolute inset-0 bg-black/[0.04] group-hover:bg-transparent transition-colors duration-500" />
            </div>

            {/* Vertical Editorial label inside the lookbook frame */}
            <div className="absolute top-8 right-8" style={{ writingMode: "vertical-rl" }}>
              <p className="text-[8px] font-black tracking-[0.45em] uppercase text-white drop-shadow-sm opacity-60">
                LOOKBOOK SERIES 2026
              </p>
            </div>

            {/* Frame Badge bottom-left */}
            <div className="absolute bottom-8 left-8 bg-black/90 backdrop-blur-sm text-white px-5 py-3.5 border border-white/10">
              <p className="text-[10px] font-black tracking-[0.25em] uppercase">CURATED DROPS</p>
              <p className="text-[9px] text-[#aaa] mt-0.5">Updated Weekly</p>
            </div>
          </div>
        </div>

        {/* Dynamic Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 slide-up-3 z-10 pointer-events-none">
          <div
            className="w-px h-8 bg-gradient-to-b from-transparent via-[#888] to-black"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          <span className="text-[7.5px] tracking-[0.4em] uppercase text-[#888] font-black mt-1">Scroll Down</span>
        </div>
      </section>

      {/* ─── MARQUEE BANNER 1 ─── */}
      <MarqueeBanner />

      {/* ─── CATEGORY SECTION (Asymmetric Masonry Grid + Grayscale Fade + Photo Animations) ─── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-16 xl:px-20 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-6">
          <div>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#888] mb-3">CURATED SELECTIONS</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-black">
              SHOP BY<br />
              <span className="font-thin text-[#aaa] italic">CATEGORY</span>
            </h2>
          </div>
          <a
            href="/shop"
            className="group inline-flex items-center gap-3 text-[12px] font-black tracking-[0.25em] uppercase text-black border-b-2 border-black pb-1 hover:text-[#666] hover:border-[#666] transition-colors"
          >
            Browse All Items
            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </a>
        </div>

        {/* Staggered Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 pt-4 pb-12">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className={`group relative block bg-[#fafafa] border border-[#f0f0f0] p-3 hover:border-black hover:bg-white transition-all duration-500 shadow-sm hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] ${cat.height}`}
            >
              <div className="relative w-full h-full overflow-hidden bg-neutral-100">
                {/* Photo with zoom, tilt, and grayscale-to-color animations */}
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1"
                />

                {/* Permanent gradient so typography is readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Large Editorial Number */}
                <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/40 font-black text-3xl tracking-tighter transition-colors duration-500">
                  {cat.num}
                </div>

                {/* Info Container */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white">
                  <span className="text-[9px] font-black tracking-[0.25em] uppercase text-white/50 mb-1">
                    {cat.count} Available Items
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-2">
                    {cat.name}
                  </h3>

                  {/* Micro-revealed text on hover */}
                  <div className="max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden">
                    <p className="text-[11px] text-[#bbb] leading-relaxed mb-4">
                      {cat.sub}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.25em] uppercase text-white border-b border-white w-fit pb-0.5">
                      Shop Now
                      <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── MARQUEE BANNER 2 (Dark) ─── */}
      <MarqueeBanner dark reverse />

      {/* ─── STATS BAR ─── */}
      <div className="bg-[#050505] border-t border-b border-[#111]">
        <div className="max-w-7xl mx-auto flex flex-wrap lg:flex-nowrap divide-y lg:divide-y-0 lg:divide-x divide-[#151515]">
          <Stat n={18} suffix="+" label="Premium Products" />
          <Stat n={12500} suffix="+" label="Happy Customers" />
          <Stat n={5400} suffix="+" label="5-Star Reviews" />
          <Stat n={100} suffix="%" label="Lifetime Satisfaction" />
        </div>
      </div>

      {/* ─── EDITORIAL PROMISE SECTION (Dark) ─── */}
      <section className="bg-[#0a0a0a] py-24 md:py-32 px-6 md:px-12 lg:px-16 xl:px-20 border-b border-[#111]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#444] mb-6">Our Creative Mandate</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white mb-8">
              BUILT FOR<br />
              <span className="font-thin text-[#444] italic">THE DETAIL-</span><br />
              ORIENTED<br />
              <span className="font-thin text-[#444] italic">COLLECTOR.</span>
            </h2>
            <p className="text-[#666] text-[13px] leading-relaxed max-w-md mb-10">
              Every item is hand-selected and meticulously tested. We avoid fleeting seasonal trends to focus entirely on physical objects that deliver utility, elegance, and pure quality.
            </p>
            <a
              href={user ? "/shop" : "/account/signup"}
              className="group inline-flex items-center gap-3 border border-neutral-800 text-white px-8 py-4 text-[12px] font-black tracking-[0.25em] uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300"
            >
              {user ? "Explore Shop" : "Create Account"}
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          </div>

          {/* Asymmetric Gallery Grid with hover animations */}
          <div className="grid grid-cols-2 gap-4">
            {[
              "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=500",
              "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=500",
              "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=500",
              "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=500",
            ].map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden group bg-[#111] p-1.5 border border-[#1e1e1e]"
                style={{ aspectRatio: i % 2 === 0 ? "1/1" : "4/5" }}
              >
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={src}
                    alt="product aesthetic showcase"
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 border border-[#222] group-hover:border-white/10 transition-colors pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── READY CTA SECTION ─── */}
      <section className="py-28 md:py-36 px-6 md:px-12 lg:px-16 xl:px-20 border-b border-[#f5f5f5] max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
          <div>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#888] mb-6">Are You Ready?</p>
            <h2 className="text-[clamp(3rem,8vw,7.5rem)] font-black tracking-tighter leading-[0.85] text-black">
              GET<br />
              <span className="font-thin text-[#c5c5c5] italic">STARTED</span><br />
              TODAY.
            </h2>
          </div>
          <div className="flex flex-col gap-6 lg:items-end">
            <p className="text-[#666] text-[13px] max-w-xs lg:text-right leading-relaxed font-normal">
              Join a community of thousands who appreciate highly functional and beautifully designed tools.
            </p>
            <a
              href={user ? "/shop" : "/account/signup"}
              className="group inline-flex items-center gap-3 bg-black text-white px-10 py-5 text-[12px] font-black tracking-[0.25em] uppercase hover:bg-neutral-850 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.18)]"
            >
              {user ? "Browse All Products" : "Create Free Profile"}
              <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
            <p className="text-[10px] text-[#aaa] font-medium select-none">Free registration · Stripe integration enabled</p>
          </div>
        </div>
      </section>

      {/* ─── LUXURY EDITORIAL FOOTER ─── */}
      <footer className="bg-[#050505] text-white pt-20">
        {/* Top Grid Area */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12 pb-16 border-b border-[#111]">
          {/* Brand/Identity */}
          <div className="flex flex-col justify-between">
            <div>
              <a href="/" className="inline-block font-black text-2xl tracking-tighter text-white mb-6">
                STORE<span className="font-thin text-[#555]">CORE</span>
              </a>
              <p className="text-[#555] text-[12.5px] leading-relaxed max-w-[220px]">
                Premium everyday essentials. Designed with meticulous precision, built to last.
              </p>
            </div>
            {/* Minimal support/address block */}
            <div className="mt-8">
              <p className="text-[8px] font-black tracking-[0.2em] text-[#333] uppercase">LOCATION</p>
              <p className="text-[11px] text-[#444] mt-1">HQ — Bengaluru, India</p>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#444] mb-6">Catalog</p>
            <ul className="space-y-4">
              {[
                ["All Products", "/shop"],
                ["Electronics", "/shop?category=Electronics"],
                ["Home Goods", "/shop?category=Home"],
                ["Style Accessories", "/shop?category=Accessories"],
                ["Clothing Collections", "/shop?category=Clothing"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-[12.5px] text-[#666] hover:text-white hover:border-b hover:border-white pb-0.5 transition-all duration-250 font-medium">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#444] mb-6">Customer Service</p>
            <ul className="space-y-4">
              {[
                ["Sign In", "/account/signin"],
                ["Create Profile", "/account/signup"],
                ["Track Orders", "/orders"],
                ["Shopping Basket", "/cart"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-[12.5px] text-[#666] hover:text-white hover:border-b hover:border-white pb-0.5 transition-all duration-250 font-medium">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial Newsletter */}
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#444] mb-6">Join The Ranks</p>
            <p className="text-[12.5px] text-[#666] leading-relaxed mb-6">
              Subscribe to unlock early access, weekly drops, and behind-the-scenes lookbooks.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center group">
              <input
                type="email"
                placeholder="Enter email address"
                required
                className="bg-transparent border-b border-[#222] py-2 px-1 text-[13px] text-white placeholder-[#444] w-full focus:border-white focus:shadow-[0_4px_16px_rgba(255,255,255,0.02)] transition-all duration-300 outline-none"
              />
              <button
                type="submit"
                aria-label="Submit newsletter"
                className="absolute right-0 p-2 text-[#444] hover:text-white group-hover:translate-x-0.5 transition-all"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom Info */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#111]">
          <p className="text-[8px] text-[#333] tracking-[0.3em] uppercase font-black">
            © 2026 STORECORE ESSENTIALS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-1.5 select-none text-[8.5px] text-[#333] font-black tracking-[0.2em] uppercase">
            <span>DESIGNED & DEVELOPED</span>
            <span>·</span>
            <span>BENGALURU</span>
          </div>
        </div>

        {/* Mega Outlined/Subtle Brand Statement at Bottom */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20 py-12 overflow-hidden select-none">
          <h1 className="text-[clamp(3.5rem,14vw,13rem)] font-black text-center tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#111111] to-[#050505] uppercase select-none font-bold">
            STORECORE
          </h1>
        </div>
      </footer>

      {/* Embedded Premium CSS Animations */}
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1)    translateX(0)    translateY(0); }
          100% { transform: scale(1.08) translateX(-2%)  translateY(-1%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
