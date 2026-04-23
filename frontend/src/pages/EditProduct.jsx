import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Electronics", "Furniture", "Kitchen", "Tools", "Sports", "Outdoor", "Clothing", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => {
      if (r.data.owner_id !== user?.id) { navigate("/"); return; }
      setForm({
        title: r.data.title, description: r.data.description, category: r.data.category,
        condition: r.data.condition, price_per_day: r.data.price_per_day || "",
        price_per_week: r.data.price_per_week || "", price_per_month: r.data.price_per_month || "",
        deposit_amount: r.data.deposit_amount || 0, special_conditions: r.data.special_conditions || "",
        rental_agreement: r.data.rental_agreement || "", status: r.data.status,
      });
    });
  }, [id, user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/products/${id}`, {
        ...form,
        price_per_day: form.price_per_day ? +form.price_per_day : null,
        price_per_week: form.price_per_week ? +form.price_per_week : null,
        price_per_month: form.price_per_month ? +form.price_per_month : null,
        deposit_amount: +form.deposit_amount || 0,
      });
      toast.success("Listing updated");
      navigate(`/products/${id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required /></div>
          <div><label className="label">Description</label><textarea className="input min-h-[100px]" value={form.description} onChange={(e) => set("description", e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="label">Condition</label>
              <select className="input" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select></div>
          </div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select></div>
          <div><label className="label">Special Conditions</label><textarea className="input" value={form.special_conditions} onChange={(e) => set("special_conditions", e.target.value)} rows={3} /></div>
          <div><label className="label">Rental Agreement</label><textarea className="input" value={form.rental_agreement} onChange={(e) => set("rental_agreement", e.target.value)} rows={4} /></div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <div className="grid grid-cols-3 gap-3">
            {[["price_per_day", "Per Day (₹)"], ["price_per_week", "Per Week (₹)"], ["price_per_month", "Per Month (₹)"]].map(([k, l]) => (
              <div key={k}><label className="label">{l}</label>
                <input type="number" className="input" value={form[k]} min="1" onChange={(e) => set(k, e.target.value)} placeholder="—" /></div>
            ))}
          </div>
          <div className="max-w-xs"><label className="label">Security Deposit (₹)</label>
            <input type="number" className="input" value={form.deposit_amount} min="0" onChange={(e) => set("deposit_amount", e.target.value)} /></div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
