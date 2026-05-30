import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  ShoppingBag,
  Loader2,
  Search,
  X,
  UploadCloud,
  Star,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Check,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import Header from "@/components/Header";
import { toast, Toaster } from "sonner";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home",
  "Accessories",
  "Beauty",
  "Sports",
  "Books",
  "Other",
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    bg: "bg-red-50",
    text: "text-red-700",
  },
};

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, color = "blue" }) {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "text-[#2563EB]" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
  };
  const c = colors[color];
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-[#111827]">{value}</p>
          {sub && <p className="mt-1 text-xs text-[#6B7280]">{sub}</p>}
        </div>
        <div className={`rounded-xl p-3 ${c.bg}`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  );
}

/* ── Product Form Slide-Over ── */
function ProductSlideOver({ open, onClose, editingProduct, onSaved }) {
  const [upload, { loading: uploading }] = useUpload();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (open) setImageUrl(editingProduct?.image_url || "");
  }, [open, editingProduct]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const method = data.id ? "PATCH" : "POST";
      const url = data.id ? `/api/products/${data.id}` : "/api/products";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(editingProduct ? "Product updated!" : "Product created!");
      onSaved();
    },
    onError: () => toast.error("Failed to save product"),
  });

  const handleFile = async (file) => {
    if (!file) return;
    const { url, error } = await upload({ file });
    if (error) {
      toast.error("Upload failed: " + error);
      return;
    }
    setImageUrl(url);
    toast.success("Image uploaded!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get("name"),
      description: fd.get("description"),
      category: fd.get("category"),
      price: parseFloat(fd.get("price")),
      stock: parseInt(fd.get("stock"), 10),
      image_url: imageUrl,
    };
    if (editingProduct?.id) data.id = editingProduct.id;
    mutation.mutate(data);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {editingProduct
                ? `Editing: ${editingProduct.name}`
                : "Fill in product details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-6 px-6 py-6">
            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                Product Image
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`relative rounded-xl border-2 border-dashed transition-colors ${
                  dragOver
                    ? "border-[#2563EB] bg-blue-50"
                    : "border-[#E5E7EB] bg-[#F9FAFB]"
                } overflow-hidden`}
                style={{ minHeight: 180 }}
              >
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-sm text-[#6B7280] hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                    <label
                      htmlFor="img-upload"
                      className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#111827] shadow-sm hover:bg-white"
                    >
                      {uploading ? "Uploading…" : "Change"}
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="img-upload"
                    className="flex flex-col items-center justify-center cursor-pointer p-10 gap-3"
                  >
                    <div className="rounded-full bg-[#EFF6FF] p-4">
                      {uploading ? (
                        <Loader2
                          size={24}
                          className="text-[#2563EB]"
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <UploadCloud size={24} className="text-[#2563EB]" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-[#111827]">
                        {uploading
                          ? "Uploading…"
                          : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        PNG, JPG, WEBP up to 4MB
                      </p>
                    </div>
                  </label>
                )}
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
              {/* Or paste URL */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-xs text-[#9CA3AF]">or paste URL</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={editingProduct?.name}
                placeholder="e.g. Ergonomic Desk Chair"
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={editingProduct?.description}
                placeholder="Describe the product features, materials, use cases…"
                className="w-full resize-none rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                required
                defaultValue={editingProduct?.category || ""}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 bg-white"
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Price (USD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
                    $
                  </span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editingProduct?.price}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#E5E7EB] pl-7 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Stock (units) <span className="text-red-400">*</span>
                </label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  required
                  defaultValue={editingProduct?.stock}
                  placeholder="0"
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#E5E7EB] px-6 py-4 flex items-center gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || uploading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors"
            >
              {mutation.isPending ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Check size={16} />
              )}
              {editingProduct ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ── Order Row ── */
function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <>
      <tr className="hover:bg-[#F9FAFB] transition-colors">
        <td className="px-6 py-4 font-mono text-sm font-semibold text-[#111827]">
          #{String(order.id).padStart(4, "0")}
        </td>
        <td className="px-6 py-4">
          <div>
            <p className="text-sm font-medium text-[#111827]">
              {order.user_email}
            </p>
            <p className="text-xs text-[#9CA3AF]">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-bold text-[#111827]">
          ${parseFloat(order.total_amount).toFixed(2)}
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </td>
        <td className="px-6 py-4">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs font-medium text-[#374151] outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </td>
        <td className="px-6 py-4 text-right">
          {items.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            >
              {items.length} item{items.length !== 1 ? "s" : ""}
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="px-6 pb-4 pt-0">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] divide-y divide-[#E5E7EB] overflow-hidden">
              {items.filter(Boolean).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-md bg-[#E5E7EB] flex items-center justify-center">
                      <Package size={14} className="text-[#9CA3AF]" />
                    </div>
                    <span className="text-sm font-medium text-[#374151]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-[#6B7280]">
                    <span>
                      Qty:{" "}
                      <strong className="text-[#111827]">
                        {item.quantity}
                      </strong>
                    </span>
                    <span className="font-semibold text-[#111827]">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Main Admin Page ── */
export default function AdminPage() {
  const { data: user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [seeding, setSeeding] = useState(false);

  /* Stats */
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: !!user && user.role === "admin",
    queryFn: async () => {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/admin/orders"),
      ]);
      const products = pRes.ok ? await pRes.json() : [];
      const orders = oRes.ok ? await oRes.json() : [];
      const revenue = orders.reduce(
        (s, o) => s + parseFloat(o.total_amount || 0),
        0,
      );
      const lowStock = products.filter((p) => p.stock < 10).length;
      return {
        productCount: products.length,
        orderCount: orders.length,
        revenue,
        lowStock,
      };
    },
  });

  /* Products */
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    enabled: !!user && user.role === "admin",
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) return [];
      return res.json();
    },
  });

  /* Orders */
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    enabled: !!user && user.role === "admin" && activeTab === "orders",
    queryFn: async () => {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Store seeded with sample products!");
    } catch {
      toast.error("Seeding failed — try again");
    } finally {
      setSeeding(false);
    }
  };

  /* Filtered lists */
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = !productCategory || p.category === productCategory;
    return matchSearch && matchCat;
  });

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch) return true;
    return (
      String(o.id).includes(orderSearch) ||
      (o.user_email || "").toLowerCase().includes(orderSearch.toLowerCase())
    );
  });

  /* Loading */
  if (userLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FAFB]">
        <Loader2
          style={{ animation: "spin 1s linear infinite" }}
          className="text-[#2563EB]"
          size={28}
        />
        <style
          jsx
          global
        >{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  /* Not admin */
  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5 bg-[#F9FAFB] font-inter">
        <div className="rounded-full bg-red-50 p-5">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#111827]">
            Admin Access Required
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            {user
              ? "Your account doesn't have admin privileges."
              : "Please sign in to continue."}
          </p>
        </div>
        {user && (
          <button
            onClick={async () => {
              await fetch("/api/admin/promote", { method: "POST" });
              window.location.reload();
            }}
            className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors shadow-lg shadow-blue-200"
          >
            <Sparkles size={16} />
            Grant Admin Access (Demo)
          </button>
        )}
        {!user && (
          <a
            href="/account/signin"
            className="rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Sign In
          </a>
        )}
        <a href="/" className="text-sm text-[#6B7280] hover:text-[#111827]">
          ← Back to Shop
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
      <Header />
      <Toaster position="top-right" />

      <ProductSlideOver
        open={slideOverOpen}
        onClose={() => {
          setSlideOverOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onSaved={() => {
          setSlideOverOpen(false);
          setEditingProduct(null);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
            >
              {seeding ? (
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Sparkles size={14} className="text-[#6B7280]" />
              )}
              Seed Sample Data
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setSlideOverOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors shadow-md shadow-blue-200"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats?.productCount ?? "—"}
            sub={`${stats?.lowStock ?? 0} low stock`}
            color="blue"
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats?.orderCount ?? "—"}
            sub="All time"
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={stats ? `$${stats.revenue.toFixed(0)}` : "—"}
            sub="Gross sales"
            color="green"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock"
            value={stats?.lowStock ?? "—"}
            sub="< 10 units remaining"
            color="amber"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1 w-fit">
          {[
            { key: "products", label: "Products", icon: Package },
            { key: "orders", label: "Orders", icon: ShoppingBag },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Products Tab ── */}
        {activeTab === "products" && (
          <div>
            {/* Search & Filter */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#2563EB]"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#9CA3AF] sm:ml-auto">
                {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {productsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2
                  style={{ animation: "spin 1s linear infinite" }}
                  className="text-[#2563EB]"
                />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-[#E5E7EB] bg-white gap-4">
                <Package size={40} className="text-[#E5E7EB]" />
                <div className="text-center">
                  <p className="font-semibold text-[#374151]">
                    No products found
                  </p>
                  <p className="text-sm text-[#9CA3AF] mt-1">
                    Try adjusting your search or add a new product
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setSlideOverOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[700px]">
                    <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Product
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Category
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Price
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Stock
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Rating
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280] text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-[#FAFAFA] transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <ImageIcon
                                      size={18}
                                      className="text-[#D1D5DB]"
                                    />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-xs text-[#9CA3AF] line-clamp-1 max-w-[200px]">
                                  {product.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#111827]">
                            ${parseFloat(product.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-sm font-semibold ${
                                product.stock === 0
                                  ? "text-red-600"
                                  : product.stock < 10
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                              }`}
                            >
                              {product.stock === 0
                                ? "Out of stock"
                                : `${product.stock} units`}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Star
                                size={13}
                                fill="currentColor"
                                className="text-[#EA580C]"
                              />
                              <span className="text-sm font-medium text-[#374151]">
                                {product.rating
                                  ? parseFloat(product.rating).toFixed(1)
                                  : "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setSlideOverOpen(true);
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Delete "${product.name}"? This cannot be undone.`,
                                    )
                                  )
                                    deleteProduct.mutate(product.id);
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order ID or customer email…"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>
              <p className="text-xs text-[#9CA3AF] sm:ml-auto">
                {filteredOrders.length} orders
              </p>
            </div>

            {ordersLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2
                  style={{ animation: "spin 1s linear infinite" }}
                  className="text-[#2563EB]"
                />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-[#E5E7EB] bg-white gap-3">
                <ShoppingBag size={40} className="text-[#E5E7EB]" />
                <div className="text-center">
                  <p className="font-semibold text-[#374151]">No orders yet</p>
                  <p className="text-sm text-[#9CA3AF] mt-1">
                    Orders will appear here once customers start buying
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Order
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Customer
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Total
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Status
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Update
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280] text-right">
                          Items
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredOrders.map((order) => (
                        <OrderRow
                          key={order.id}
                          order={order}
                          onStatusChange={(id, status) =>
                            updateOrderStatus.mutate({ id, status })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style
        jsx
        global
      >{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
