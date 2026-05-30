import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import { useEffect } from "react";
import useCart from "@/utils/useCart";

export default function OrdersPage() {
  const { clearCart } = useCart();

  // Clear cart if session_id is present (returned from Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("session_id")) {
      // In a real app, you'd confirm the order via webhook/API here
      // For this demo, we'll assume success and clear the cart
      clearCart();
    }
  }, [clearCart]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      return res.json();
    },
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={16} />;
      case "shipped":
        return <Truck className="text-blue-500" size={16} />;
      default:
        return <Clock className="text-orange-500" size={16} />;
    }
  };

  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
      <Header />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
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
        ) : ordersList.length === 0 ? (
          <div className="border border-[#E5E7EB] bg-white p-12 text-center">
            <ShoppingBag
              className="mx-auto mb-4 text-black opacity-20"
              size={48}
            />
            <p className="text-lg font-medium text-[#111827]">No orders yet</p>
            <p className="text-sm text-[#6B7280] mb-6">
              Start your shopping journey today.
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
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
                        Total
                      </p>
                      <p className="text-sm font-semibold text-[#111827]">
                        ₹{order.total_amount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-xs font-medium text-black uppercase tracking-wider">
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
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
                          src={
                            item.image_url || "https://via.placeholder.com/64"
                          }
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
                        ₹{item.price}
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
