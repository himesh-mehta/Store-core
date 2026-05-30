import { useEffect } from "react";
import useAuth from "@/utils/useAuth";

function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut();
        window.location.href = "/";
      } catch (error) {
        console.error("Sign out failed:", error);
        window.location.href = "/";
      }
    };
    
    handleSignOut();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] font-inter text-sm text-[#6B7280]">
      Signing out...
    </div>
  );
}

export default LogoutPage;
