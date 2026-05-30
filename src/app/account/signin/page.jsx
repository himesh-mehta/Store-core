import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SigninPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { signInWithCredentials, signInWithGoogle } = useAuth();

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try { await signInWithGoogle(); window.location.href = "/shop"; }
    catch (e) { setError(e?.message || "Google sign in failed."); setLoading(false); }
  };

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    try { await signInWithCredentials({ email, password }); window.location.href = "/shop"; }
    catch (e) {
      const c = e?.code;
      setError(
        c === "auth/user-not-found" || c === "auth/wrong-password" || c === "auth/invalid-credential"
          ? "Incorrect email or password."
          : c === "auth/operation-not-allowed"
          ? "Email sign-in is not enabled. Use Google."
          : e?.message || "Sign in failed."
      );
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-[#e5e5e5] bg-[#f5f5f5] px-4 py-3.5 text-[13px] text-black placeholder-[#bbb] focus:border-black focus:bg-white focus:outline-none transition-all font-medium";

  return (
    <div className="min-h-screen bg-white flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-[#111] p-12">
        <a href="/" className="font-black text-xl tracking-tighter text-white">
          STORE<span className="font-thin text-[#888]">CORE</span>
        </a>
        <div>
          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#888] mb-5">Welcome back</p>
          <h2 className="text-5xl font-black tracking-tighter leading-none text-white mb-6">
            Sign<br />
            <span className="font-thin text-[#888]">back in.</span>
          </h2>
          <p className="text-[#888] text-sm leading-relaxed max-w-xs">
            Access your orders, saved items, and exclusive collection.
          </p>
        </div>
        <p className="text-[10px] text-[#555] tracking-widest uppercase font-bold">© 2026 StoreCore</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <a href="/" className="lg:hidden inline-block font-black text-xl tracking-tighter text-black mb-10">
            STORE<span className="font-thin text-[#888]">CORE</span>
          </a>

          <p className="text-[9px] font-black tracking-[0.3em] uppercase text-[#888] mb-2">Account</p>
          <h1 className="text-4xl font-black tracking-tighter text-black mb-10">Sign in</h1>

          {/* Google */}
          <button
            type="button" onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-[#e5e5e5] bg-[#f5f5f5] py-3.5 text-[12px] font-bold text-black hover:border-black hover:bg-white transition-all mb-4 tracking-wide disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28-0.96,2.37-2.04,3.1v2.57h3.3C20.6,17.73,21.68,14.73,21.68,11.26,21.68,11.53,21.56,11.43,21.35,11.1z" fill="#4285F4"/>
              <path d="M12,20.6c2.59,0,4.77-0.86,6.36-2.33l-3.3-2.57c-0.91,0.61-2.08,0.97-3.06,0.97-2.35,0-4.35-1.59-5.06-3.72H3.5v2.66C5.12,18.73,8.32,20.6,12,20.6z" fill="#34A853"/>
              <path d="M6.94,12.96c-0.18-0.54-0.28-1.11-0.28-1.7,0-0.59,0.1-1.16,0.28-1.7V6.9H3.5C2.88,8.14,2.53,9.53,2.53,11c0,1.47,0.35,2.86,0.97,4.1L6.94,12.96z" fill="#FBBC05"/>
              <path d="M12,6.13c1.41,0,2.68,0.49,3.68,1.44l2.76-2.76C16.77,3.23,14.59,2.3,12,2.3,8.32,2.3,5.12,4.17,3.5,7.3l3.44,2.66C7.65,7.72,9.65,6.13,12,6.13z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#f0f0f0]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#bbb]">or</span>
            <div className="flex-1 h-px bg-[#f0f0f0]" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-[#888] mb-1.5">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-[#888] mb-1.5">Password</label>
              <div className="relative">
                <input required type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-black transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600 font-medium">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="group w-full flex items-center justify-center gap-3 bg-black text-white py-4 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-[#222] transition-all disabled:opacity-50 mt-2">
              {loading
                ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : (<>Sign In <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" /></>)
              }
            </button>
          </form>

          <p className="mt-8 text-[12px] text-[#888]">
            No account?{" "}
            <a href="/account/signup" className="font-bold text-black hover:text-[#444] transition-colors underline underline-offset-2">
              Create one →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
