import { ShoppingCart, X, Menu, Package, LogOut, ShoppingBag, ArrowRight } from "lucide-react";
import useUser from "@/utils/useUser";
import useCart from "@/utils/useCart";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const { data: user } = useUser();
  const { items } = useCart();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prevCount = useRef(cartCount);
  const [badgeAnim, setBadgeAnim] = useState(false);

  useEffect(() => {
    if (cartCount !== prevCount.current) {
      setBadgeAnim(true);
      const t = setTimeout(() => setBadgeAnim(false), 400);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Electronics", href: "/shop?category=Electronics" },
    { label: "Home", href: "/shop?category=Home" },
    { label: "Accessories", href: "/shop?category=Accessories" },
    { label: "Clothing", href: "/shop?category=Clothing" },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: "#fff",
          borderBottom: scrolled ? "1px solid #e5e5e5" : "1px solid transparent",
          boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex h-14 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-px font-black text-lg tracking-tighter text-black z-10 select-none">
            STORE
            <span className="font-thin text-[#888]">CORE</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] font-medium text-[#888] hover:text-black transition-colors duration-150 tracking-wide uppercase"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <a
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f5f5f5] transition-colors"
            >
              <ShoppingCart size={19} strokeWidth={1.75} className="text-black" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] flex items-center justify-center rounded-full bg-black text-white text-[9px] font-black leading-none"
                  style={{ animation: badgeAnim ? "badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </a>

            {/* User actions - desktop */}
            {user ? (
              <div className="hidden lg:flex items-center gap-1 ml-1 pl-3 border-l border-[#e5e5e5]">
                <a
                  href="/orders"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f5f5f5] transition-colors text-[#888] hover:text-black"
                  title="Orders"
                >
                  <Package size={18} strokeWidth={1.75} />
                </a>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e5e5e5] rounded-full">
                  <div
                    className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-black"
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] text-[#222] font-medium max-w-[100px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
                <a
                  href="/account/logout"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f5f5f5] transition-colors text-[#888] hover:text-red-600"
                  title="Sign out"
                >
                  <LogOut size={15} strokeWidth={1.75} />
                </a>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 ml-1 pl-3 border-l border-[#e5e5e5]">
                <a href="/account/signin" className="text-[13px] font-medium text-[#888] hover:text-black transition-colors">
                  Sign in
                </a>
                <a
                  href="/account/signup"
                  className="text-[12px] font-bold bg-black text-white px-4 py-2 rounded-full hover:bg-[#222] transition-colors tracking-wide"
                >
                  Get started
                </a>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f5f5f5] transition-colors ml-1"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.75} className="text-black" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" style={{ animation: "fadeIn 0.2s ease" }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col"
            style={{ animation: "drawerIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}
          >
            <div className="flex items-center justify-between px-6 h-14 border-b border-[#f0f0f0]">
              <span className="font-black text-lg tracking-tighter text-black">
                STORE<span className="font-thin text-[#888]">CORE</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#f5f5f5] transition-colors"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <nav className="flex-1 px-6 py-8 space-y-1">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 border-b border-[#f5f5f5] text-sm font-semibold text-[#222] hover:text-black tracking-wide uppercase group"
                >
                  {label}
                  <ArrowRight size={14} className="text-[#888] group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </nav>

            <div className="px-6 pb-8 border-t border-[#f5f5f5] pt-6 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-black text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">{user.email?.split("@")[0]}</p>
                      <p className="text-xs text-[#888] truncate max-w-[160px]">{user.email}</p>
                    </div>
                  </div>
                  <a href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-[#888] hover:text-black font-medium">
                    <Package size={15} /> My Orders
                  </a>
                  <a href="/account/logout" className="flex items-center gap-2 text-sm text-red-500 font-medium">
                    <LogOut size={15} /> Sign out
                  </a>
                </>
              ) : (
                <>
                  <a href="/account/signup" className="block text-center bg-black text-white font-bold text-sm py-3.5 rounded-full hover:bg-[#222] transition-colors tracking-wide">
                    Get Started Free
                  </a>
                  <a href="/account/signin" className="block text-center text-sm font-medium text-[#888] hover:text-black transition-colors">
                    Sign in
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
