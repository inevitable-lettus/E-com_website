import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

const CATEGORIES = ["Electronics", "Furniture", "Kitchen", "Tools", "Sports", "Outdoor", "Clothing", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

export default function ListProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "Electronics", condition: "Good",
    price_per_day: "", price_per_week: "", price_per_month: "",
    deposit_amount: "0", images: [], special_conditions: "", rental_agreement: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (files) => {
    if (!files.length) return;
    setUploadingImages(true);
    try {
      // First create a draft product, upload images, then update
      const draft = await api.post("/products", {
        ...form,
        price_per_day: form.price_per_day ? +form.price_per_day : null,
        price_per_week: form.price_per_week ? +form.price_per_week : null,
        price_per_month: form.price_per_month ? +form.price_per_month : null,
        deposit_amount: +form.deposit_amount || 0,
        images: form.images,
      });
      const productId = draft.data.id;
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await api.post(`/products/${productId}/upload-image`, fd);
        urls.push(r.data.url);
      }
      set("images", [...form.images, ...urls]);
      // delete draft — we'll re-create on submit with full data
      await api.delete(`/products/${productId}`);
    } catch (e) {
      toast.error("Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.price_per_day && !form.price_per_week && !form.price_per_month) {
      toast.error("At least one price option is required");
      return;
    }
    setLoading(true);
    try {
      const r = await api.post("/products", {
        ...form,
        price_per_day: form.price_per_day ? +form.price_per_day : null,
        price_per_week: form.price_per_week ? +form.price_per_week : null,
        price_per_month: form.price_per_month ? +form.price_per_month : null,
        deposit_amount: +form.deposit_amount || 0,
      });
      toast.success("Listing created!");
      navigate(`/products/${r.data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">List an Item</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Item Details</h2>
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g., Canon DSLR Camera with Kit Lens" required maxLength={255} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input min-h-[120px]" value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the item — what it is, what's included, how it's been used…" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Condition *</label>
              <select className="input" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Special Conditions</label>
            <textarea className="input" value={form.special_conditions}
              onChange={(e) => set("special_conditions", e.target.value)}
              placeholder="Any special handling requirements, return instructions…" rows={3} />
          </div>
          <div>
            <label className="label">Rental Agreement (optional)</label>
            <textarea className="input" value={form.rental_agreement}
              onChange={(e) => set("rental_agreement", e.target.value)}
              placeholder="Terms and conditions for renting this item…" rows={4} />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <p className="text-xs text-gray-500">Set at least one price. System picks the best rate for the rental duration.</p>
          <div className="grid grid-cols-3 gap-3">
            {[["price_per_day", "Per Day (₹)"], ["price_per_week", "Per Week (₹)"], ["price_per_month", "Per Month (₹)"]].map(([k, l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input type="number" className="input" value={form[k]} min="1"
                  onChange={(e) => set(k, e.target.value)} placeholder="—" />
              </div>
            ))}
          </div>
          <div className="max-w-xs">
            <label className="label">Security Deposit (₹)</label>
            <input type="number" className="input" value={form.deposit_amount} min="0"
              onChange={(e) => set("deposit_amount", e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Refunded to renter on return. Use ₹0 for no deposit.</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Photos</h2>
          {form.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-primary-400 transition-colors">
            <Upload size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Add photos</p>
              <p className="text-xs text-gray-400">JPG, PNG up to 10MB each</p>
            </div>
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handleImageUpload(Array.from(e.target.files))} disabled={uploadingImages} />
          </label>
          <p className="text-xs text-gray-400">
            Note: photos will appear after the listing is created. You can add them immediately after.
          </p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? "Creating listing…" : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
