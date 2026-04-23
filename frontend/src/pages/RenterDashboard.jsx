import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Package, Star } from "lucide-react";
import api from "../api";
import StarRating from "../components/StarRating";

const STATUS_LABEL = { pending: "Pending Approval", active: "Active", completed: "Completed", cancelled: "Cancelled", overdue: "Overdue" };

export default function RenterDashboard() {
  const [rentals, setRentals] = useState([]);
  const [extending, setExtending] = useState({});
  const [newEndDate, setNewEndDate] = useState({});
  const [reviewing, setReviewing] = useState({});
  const [reviewForm, setReviewForm] = useState({});

  useEffect(() => {
    api.get("/rentals/my-rentals").then((r) => setRentals(r.data));
  }, []);

  const requestExtension = async (rentalId) => {
    const nd = newEndDate[rentalId];
    if (!nd) { toast.error("Select a new end date"); return; }
    try {
      await api.post(`/rentals/${rentalId}/request-extension`, { new_end_date: nd });
      toast.success("Extension requested");
      const r = await api.get("/rentals/my-rentals");
      setRentals(r.data);
      setExtending({ ...extending, [rentalId]: false });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const submitReview = async (rentalId, productId) => {
    const rf = reviewForm[rentalId];
    if (!rf?.rating) { toast.error("Select a rating"); return; }
    try {
      await api.post("/reviews", {
        rental_id: rentalId,
        rating: rf.rating,
        comment: rf.comment || "",
        review_type: "product_owner",
      });
      toast.success("Review submitted!");
      setReviewing({ ...reviewing, [rentalId]: false });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to submit review");
    }
  };

  const totalSpent = rentals.filter((r) => ["active", "completed"].includes(r.status))
    .reduce((s, r) => s + r.total_amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Rentals</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Rentals", value: rentals.length },
          { label: "Active", value: rentals.filter((r) => r.status === "active").length },
          { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}` },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {rentals.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Package size={40} className="mx-auto mb-3 text-gray-200" />
          <p>No rentals yet. <Link to="/browse" className="text-primary-600 hover:underline">Browse items →</Link></p>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-4">
                <Link to={`/products/${r.product_id}`}>
                  <img src={r.product?.images?.[0] || `https://picsum.photos/seed/${r.product_id}/80/80`}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 hover:opacity-90" alt="" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/products/${r.product_id}`} className="font-semibold text-gray-900 hover:text-primary-600 truncate">
                      {r.product?.title}
                    </Link>
                    <span className={`status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
                    {r.extension_requested && <span className="badge bg-purple-100 text-purple-800">Extension Pending</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">Owner: {r.owner?.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(r.start_date), "d MMM")} → {format(new Date(r.end_date), "d MMM yyyy")}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-semibold text-gray-900">₹{parseFloat(r.total_amount).toLocaleString("en-IN")}</span>
                    {r.deposit_amount > 0 && (
                      <span className="text-xs text-gray-400">+ ₹{parseFloat(r.deposit_amount).toLocaleString("en-IN")} deposit</span>
                    )}
                    {r.penalty_amount > 0 && (
                      <span className="text-xs text-red-600">+ ₹{parseFloat(r.penalty_amount).toLocaleString("en-IN")} penalty</span>
                    )}
                  </div>
                </div>
              </div>

              {r.status === "active" && !r.extension_requested && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {!extending[r.id] ? (
                    <button onClick={() => setExtending({ ...extending, [r.id]: true })}
                      className="text-sm text-primary-600 hover:underline font-medium">
                      Request extension →
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input type="date" className="input max-w-xs text-sm" min={r.end_date}
                        value={newEndDate[r.id] || ""} onChange={(e) => setNewEndDate({ ...newEndDate, [r.id]: e.target.value })} />
                      <button onClick={() => requestExtension(r.id)} className="btn-primary text-sm px-3 py-1.5">Request</button>
                      <button onClick={() => setExtending({ ...extending, [r.id]: false })} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {r.status === "completed" && !r.review && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {!reviewing[r.id] ? (
                    <button onClick={() => setReviewing({ ...reviewing, [r.id]: true })}
                      className="flex items-center gap-1 text-sm text-amber-600 hover:underline font-medium">
                      <Star size={14} /> Leave a review
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <StarRating value={reviewForm[r.id]?.rating || 0}
                        onChange={(v) => setReviewForm({ ...reviewForm, [r.id]: { ...reviewForm[r.id], rating: v } })} />
                      <textarea className="input text-sm" rows={3} placeholder="Share your experience…"
                        value={reviewForm[r.id]?.comment || ""}
                        onChange={(e) => setReviewForm({ ...reviewForm, [r.id]: { ...reviewForm[r.id], comment: e.target.value } })} />
                      <div className="flex gap-2">
                        <button onClick={() => submitReview(r.id, r.product_id)} className="btn-primary text-sm px-3 py-1.5">Submit</button>
                        <button onClick={() => setReviewing({ ...reviewing, [r.id]: false })} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
