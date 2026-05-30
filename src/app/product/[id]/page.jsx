import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Star,
  ShieldCheck,
  Loader2,
  Send,
  Trash2,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import useCart from "@/utils/useCart";
import useUser from "@/utils/useUser";
import { Toaster, toast } from "sonner";

/* ---------- Star Rating Input ---------- */
function StarInput({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            size={22}
            className={n <= active ? "text-[#EA580C]" : "text-[#D1D5DB]"}
            fill={n <= active ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

/* ---------- Single Review Card ---------- */
function ReviewCard({ review, currentUserId, onDelete }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const initials = review.user_email
    ? review.user_email.slice(0, 2).toUpperCase()
    : "??";
  const isOwn = String(review.user_id) === String(currentUserId);
  const dateStr = new Date(review.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#2563EB]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {review.user_email}
            </p>
            <p className="text-xs text-[#9CA3AF]">{dateStr}</p>
          </div>
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(review.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-0.5">
        {stars.map((n) => (
          <Star
            key={n}
            size={14}
            className={n <= review.rating ? "text-[#EA580C]" : "text-[#E5E7EB]"}
            fill={n <= review.rating ? "currentColor" : "currentColor"}
          />
        ))}
      </div>
      {review.comment && (
        <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
          {review.comment}
        </p>
      )}
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function ProductDetailPage({ params }) {
  const { id } = params;
  const { addItem } = useCart();
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  /* Fetch product */
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
  });

  /* Fetch related products (same category, exclude current) */
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related", product?.category, id],
    enabled: !!product?.category,
    queryFn: async () => {
      const res = await fetch(
        `/api/products?category=${encodeURIComponent(product.category)}`,
      );
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((p) => String(p.id) !== String(id)).slice(0, 4);
    },
  });

  /* Fetch reviews */
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  /* Submit review */
  const submitMutation = useMutation({
    mutationFn: async ({ rating, comment }) => {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setRating(0);
      setComment("");
      toast.success("Review submitted!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  /* Delete review */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Review deleted");
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const userReview = reviews.find(
    (r) => String(r.user_id) === String(user?.id),
  );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length / reviews.length) *
              100,
          )
        : 0,
  }));

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2
          style={{ animation: "spin 1s linear infinite" }}
          className="text-[#2563EB]"
        />
        <style
          jsx
          global
        >{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  if (!product || product.error)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F9FAFB] font-inter">
        <h1 className="text-2xl font-semibold text-[#111827]">
          Product not found
        </h1>
        <a
          href="/"
          className="text-sm font-medium text-[#2563EB] hover:underline"
        >
          Back to Shop
        </a>
      </div>
    );

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#6B7280]">
          <a href="/" className="hover:text-[#111827]">
            Shop
          </a>
          <ChevronRight size={14} />
          <span className="text-[#2563EB] font-medium">{product.category}</span>
          <ChevronRight size={14} />
          <span className="text-[#111827] truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Hero */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white aspect-square">
            <img
              src={product.image_url || "https://via.placeholder.com/600"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                {product.category}
              </span>
              {avgRating && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={
                          n <= Math.round(avgRating)
                            ? "text-[#EA580C]"
                            : "text-[#E5E7EB]"
                        }
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#111827]">
                    {avgRating}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-[#111827] mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl font-bold text-[#111827]">
                ₹{product.price}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  !isOutOfStock
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {!isOutOfStock ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="prose prose-sm text-[#6B7280] mb-8">
              <p className="leading-relaxed">{product.description}</p>
              <ul className="mt-4 space-y-2 list-none p-0">
                <li className="flex items-center gap-2">
                  <span className="text-[#2563EB] mr-1">—</span> Premium
                  technical build
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2563EB] mr-1">—</span> Modern design
                  language
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2563EB] mr-1">—</span> Satisfaction
                  guarantee
                </li>
              </ul>
            </div>

            <div className="mt-auto space-y-4">
              <button
                disabled={isOutOfStock}
                onClick={() => {
                  addItem(product);
                  toast.success(`${product.name} added to cart`);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-4 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#6B7280]">
                <ShieldCheck size={14} className="text-green-500" />
                Secure payment & satisfaction guarantee
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <section className="mt-20">
          <div className="mb-8 flex items-center gap-3">
            <MessageSquare size={20} className="text-[#2563EB]" />
            <h2 className="text-2xl font-semibold text-[#111827]">
              Customer Reviews
            </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Left: Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                {reviews.length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-[#111827]">
                        {avgRating}
                      </div>
                      <div className="flex justify-center mt-2 gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={18}
                            className={
                              n <= Math.round(avgRating)
                                ? "text-[#EA580C]"
                                : "text-[#E5E7EB]"
                            }
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        {reviews.length}{" "}
                        {reviews.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {ratingBreakdown.map(({ star, count, pct }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-[#6B7280] w-3">
                            {star}
                          </span>
                          <Star
                            size={12}
                            fill="currentColor"
                            className="text-[#EA580C]"
                          />
                          <div className="flex-1 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#EA580C] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#9CA3AF] w-4">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Star
                      size={36}
                      className="text-[#E5E7EB] mx-auto mb-3"
                      fill="currentColor"
                    />
                    <p className="text-sm font-medium text-[#111827]">
                      No reviews yet
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Be the first to share your experience
                    </p>
                  </div>
                )}

                {/* Write Review Form */}
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <h3 className="text-sm font-semibold text-[#111827] mb-4">
                    {userReview ? "Update Your Review" : "Write a Review"}
                  </h3>

                  {!user ? (
                    <div className="rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-center">
                      <p className="text-xs text-[#6B7280] mb-2">
                        Sign in to leave a review
                      </p>
                      <a
                        href="/account/signin"
                        className="text-xs font-semibold text-[#2563EB] hover:underline"
                      >
                        Sign in →
                      </a>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!rating) {
                          toast.error("Please select a star rating");
                          return;
                        }
                        submitMutation.mutate({ rating, comment });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-2">
                          Your rating
                        </label>
                        <StarInput
                          value={userReview ? userReview.rating : rating}
                          onChange={setRating}
                          disabled={submitMutation.isPending}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-2">
                          Your comment (optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder={
                            userReview
                              ? userReview.comment || "Add a comment..."
                              : "Share your experience..."
                          }
                          rows={3}
                          className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
                      >
                        {submitMutation.isPending ? (
                          <Loader2
                            size={16}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                        ) : (
                          <Send size={16} />
                        )}
                        {userReview ? "Update Review" : "Submit Review"}
                      </button>

                      {userReview && (
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate()}
                          disabled={deleteMutation.isPending}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                          Delete my review
                        </button>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Review List */}
            <div className="lg:col-span-2">
              {reviews.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white text-center">
                  <MessageSquare size={32} className="text-[#E5E7EB] mb-3" />
                  <p className="text-sm font-medium text-[#9CA3AF]">
                    No reviews yet — be the first!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      currentUserId={user?.id}
                      onDelete={() => deleteMutation.mutate()}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827]">
                  Related Products
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  More from{" "}
                  <span className="font-medium text-[#2563EB]">
                    {product.category}
                  </span>
                </p>
              </div>
              <a
                href={`/?category=${encodeURIComponent(product.category)}`}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
              >
                View all <ChevronRight size={16} />
              </a>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-20 border-t border-[#E5E7EB] bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-[#6B7280]">
            © 2026 StoreCore Essentials. Built with technical precision.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
