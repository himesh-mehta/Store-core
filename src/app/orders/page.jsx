import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  Loader2,
  PartyPopper,
} from "lucide-react";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import useCart from "@/utils/useCart";
import { auth } from "@/utils/firebase";

async function fetchOrders() {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Not authenticated");
  const idToken = await firebaseUser.getIdToken();

  const res = await fetch("/api/orders", {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch orders");
  }
  return res.json();
}

export default function OrdersPage() {
  const { clearCart } = useCart();
  const [justPaid, setJustPaid] = useState(false);

  // Clear cart if Stripe redirected back with session_id (payment confirmed by Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    if (sessionId) {
      clearCart();
      setJustPaid(true);
      // Clean up the URL without reloading
      window.history.replaceState({}, "", "/orders");
    }
  }, [clearCart]);

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    retry: 1,
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={16} />;
      case "shipped":
        return <Truck className="text-blue-500" size={16} />;
      case "paid":
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <Clock className="text-orange-500" size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    if (status === "paid") return "Confirmed";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
      <Header />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">

        {/* Success banner after Stripe redirect */}
        {justPaid && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
            <PartyPopper size={20} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Payment successful!</p>
              <p className="text-emerald-700 text-xs mt-0.5">
                Your order has been placed. It may take a few seconds to appear below.
              </p>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-white border border-black">
            <Package size={20} className="text-black" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            Order History
          </h1>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-black" />
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-6 rounded-lg text-center">
            <p className="text-red-700 font-medium text-sm">
              {error.message === "Not authenticated"
                ? "Please sign in to view your orders."
                : "Could not load orders. Please try again."}
            </p>
            {error.message === "Not authenticated" && (
              <a
                href="/account/signin?callbackUrl=/orders"
                className="mt-3 inline-block text-sm font-semibold text-black underline"
              >
                Sign in
              </a>
            )}
          </div>
        ) : ordersList.length === 0 ? (
          <div className="border border-[#E5E7EB] bg-white p-12 text-center">
            <ShoppingBag
              className="mx-auto mb-4 text-black opacity-20"
              size={48}
            />
            <p className="text-lg font-medium text-[#111827]">No orders yet</p>
            <p className="text-sm text-[#6B7280] mb-6">
              {justPaid
                ? "Your order is being processed — refresh in a moment."
                : "Start your shopping journey today."}
            </p>
            <a
              href="/"
              className="inline-flex bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors uppercase tracking-widest"
            >
              Go to Store
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {ordersList.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden border border-[#E5E7EB] bg-white"
              >
                <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-[#111827]">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
                        Total
                      </p>
                      <p className="text-sm font-semibold text-[#111827]">
                        ₹{Number(order.total_amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-xs font-medium text-black uppercase tracking-wider">
                      {getStatusIcon(order.status)}
                      <span>{getStatusLabel(order.status)}</span>
                    </span>
                    <span className="text-xs font-medium text-[#6B7280]">
                      Order #{order.id}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-6 divide-y divide-[#E5E7EB]">
                  {Array.isArray(order.items) && order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden border border-[#E5E7EB]">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=80"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=80";
                          }}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-[#111827]">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#6B7280]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#111827]">
                        ₹{Number(item.price).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
