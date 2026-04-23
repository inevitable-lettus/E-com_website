import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Package, CheckCircle, XCircle, RotateCcw, Plus } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_LABEL = { pending: "Pending", active: "Active", completed: "Completed", cancelled: "Cancelled", overdue: "Overdue" };

export default function OwnerDashboard() {
  const { refreshUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [tab, setTab] = useState("rentals");

  useEffect(() => {
    api.get("/products/my").then((r) => setProducts(r.data));
    api.get("/rentals/owner-rentals").then((r) => setRentals(r.data));
  }, []);

  const act = async (action, rentalId, label) => {
    try {
      await api.put(`/rentals/${rentalId}/${action}`);
      toast.success(`${label} successfully`);
      const [r, u] = await Promise.all([api.get("/rentals/owner-rentals"), refreshUser()]);
      setRentals(r.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Action failed");
    }
  };

  const totalEarned = rentals.filter((r) => r.status === "completed").reduce((s, r) => s + r.total_amount, 0);
  const activeCount = rentals.filter((r) => r.status === "active").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        <Link to="/list" className="btn-primary flex items-center gap-1.5"><Plus size={16} /> New Listing</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Listings", value: products.length, color: "text-gray-900" },
          { label: "Active Rentals", value: activeCount, color: "text-blue-600" },
          { label: "Total Earned", value: `₹${totalEarned.toLocaleString("en-IN")}`, color: "text-primary-600" },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {["rentals", "listings"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "rentals" ? "Rental Requests" : "My Listings"}
          </button>
        ))}
      </div>

      {tab === "rentals" ? (
        <div className="space-y-4">
          {rentals.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">No rental requests yet.</div>
          ) : rentals.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-4">
                <img src={r.product?.images?.[0] || `https://picsum.photos/seed/${r.product_id}/80/80`}
                  className="w-16 h-16 rounded-lg object-cover shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 truncate">{r.product?.title}</p>
                    <span className={`status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
                    {r.extension_requested && <span className="badge bg-purple-100 text-purple-800">Extension Requested</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Renter: <span className="font-medium text-gray-700">{r.renter?.name}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(r.start_date), "d MMM")} → {format(new Date(r.end_date), "d MMM yyyy")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">₹{parseFloat(r.total_amount).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => act("approve", r.id, "Rental approved")}
                        className="flex items-center gap-1 text-xs btn-primary px-3 py-1.5">
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => act("reject", r.id, "Rental rejected")}
                        className="flex items-center gap-1 text-xs btn-danger px-3 py-1.5">
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                  {r.status === "active" && (
                    <button onClick={() => act("return", r.id, "Return confirmed")}
                      className="flex items-center gap-1 text-xs btn-secondary px-3 py-1.5">
                      <RotateCcw size={13} /> Confirm Return
                    </button>
                  )}
                  {r.status === "active" && r.extension_requested && (
                    <button onClick={() => act("approve-extension", r.id, "Extension approved")}
                      className="flex items-center gap-1 text-xs btn-primary px-3 py-1.5 bg-purple-600 hover:bg-purple-700">
                      Approve Extension
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 text-gray-200" />
              <p>No listings yet. <Link to="/list" className="text-primary-600 hover:underline">Create one →</Link></p>
            </div>
          ) : products.map((p) => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/80/80`}
                className="w-14 h-14 rounded-lg object-cover shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-500">{p.category} · {p.condition}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`status-${p.status}`}>{p.status}</span>
                  {p.price_per_day && <span className="text-xs text-gray-500">₹{p.price_per_day}/day</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/products/${p.id}/edit`} className="btn-secondary text-xs px-3 py-1.5">Edit</Link>
                <Link to={`/products/${p.id}`} className="btn-primary text-xs px-3 py-1.5">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
