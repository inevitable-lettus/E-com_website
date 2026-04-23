import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, MessageCircle, Shield, AlertCircle, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { format, addDays, differenceInDays } from "date-fns";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ReviewCard from "../components/ReviewCard";

const COND_COLOR = { Excellent: "text-green-700", Good: "text-blue-700", Fair: "text-yellow-700", Poor: "text-red-700" };

export default function ProductDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 4), "yyyy-MM-dd"));
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews/product/${id}`),
    ]).then(([p, r]) => { setProduct(p.data); setReviews(r.data); })
      .catch(() => navigate("/browse"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return null;

  const images = product.images?.length ? product.images : [`https://picsum.photos/seed/${product.id}/800/600`];
  const days = differenceInDays(new Date(endDate), new Date(startDate));

  const computePrice = () => {
    if (days <= 0) return null;
    if (product.price_per_month && days >= 28) return +(product.price_per_month * days / 30).toFixed(2);
    if (product.price_per_week && days >= 7) return +(product.price_per_week * days / 7).toFixed(2);
    if (product.price_per_day) return +(product.price_per_day * days).toFixed(2);
    return null;
  };
  const rentalCost = computePrice();
  const totalCost = rentalCost != null ? rentalCost + (product.deposit_amount || 0) : null;

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!agreedToTerms) { toast.error("Please accept the rental agreement"); return; }
    if (days <= 0) { toast.error("End date must be after start date"); return; }
    setBooking(true);
    try {
      await api.post("/rentals", {
        product_id: product.id,
        start_date: startDate,
        end_date: endDate,
        rental_agreement_accepted: true,
        notes: "",
      });
      await refreshUser();
      toast.success("Rental request sent! Waiting for owner approval.");
      navigate("/dashboard/renter");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const handleChat = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const r = await api.post(`/chats/start/${product.id}`);
      navigate(`/chat/${r.data.id}`);
    } catch (e) {
      toast.error("Failed to start chat");
    }
  };

  const isOwner = user?.id === product.owner_id;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/browse" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Back to browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — Images + Info */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card overflow-hidden">
            <div className="relative aspect-[4/3] bg-gray-100">
              <img src={images[imgIdx]} alt={product.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx((imgIdx + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-primary-600" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{product.category}</span>
                  <span className={`font-medium text-sm ${COND_COLOR[product.condition]}`}>● {product.condition} condition</span>
                  {avgRating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{avgRating}</span>
                      <span className="text-gray-400">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              {isOwner && (
                <Link to={`/products/${id}/edit`} className="btn-secondary flex items-center gap-1.5 shrink-0 text-sm">
                  <Edit size={15} /> Edit
                </Link>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {product.special_conditions && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-1">
                  <AlertCircle size={15} /> Special Conditions
                </div>
                <p className="text-sm text-amber-700">{product.special_conditions}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Listed by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {product.owner?.name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.owner?.name}</p>
                  <p className="text-xs text-gray-400">Member since {format(new Date(product.owner?.created_at || Date.now()), "MMM yyyy")}</p>
                </div>
                {!isOwner && user && (
                  <button onClick={handleChat}
                    className="ml-auto btn-secondary flex items-center gap-1.5 text-sm">
                    <MessageCircle size={15} /> Chat
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
            </h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right — Booking */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24 space-y-5">
            {/* Pricing */}
            <div className="space-y-1">
              {product.price_per_day && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Per day</span>
                  <span className="font-semibold">₹{parseFloat(product.price_per_day).toLocaleString("en-IN")}</span>
                </div>
              )}
              {product.price_per_week && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Per week</span>
                  <span className="font-semibold">₹{parseFloat(product.price_per_week).toLocaleString("en-IN")}</span>
                </div>
              )}
              {product.price_per_month && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Per month</span>
                  <span className="font-semibold">₹{parseFloat(product.price_per_month).toLocaleString("en-IN")}</span>
                </div>
              )}
              {product.deposit_amount > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Shield size={12} /> Security deposit
                  </span>
                  <span className="font-semibold">₹{parseFloat(product.deposit_amount).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {product.status !== "available" ? (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 text-sm text-center font-medium">
                Currently rented out
              </div>
            ) : isOwner ? (
              <div className="bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-4 text-sm text-center">
                This is your listing
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Start date</label>
                    <input type="date" className="input" value={startDate} min={tomorrow}
                      onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">End date</label>
                    <input type="date" className="input" value={endDate} min={startDate}
                      onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                {days > 0 && rentalCost != null && (
                  <div className="bg-primary-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{days} day{days !== 1 ? "s" : ""} rental</span>
                      <span>₹{rentalCost.toLocaleString("en-IN")}</span>
                    </div>
                    {product.deposit_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Refundable deposit</span>
                        <span>₹{parseFloat(product.deposit_amount).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-primary-700 border-t border-primary-100 pt-2">
                      <span>Total charged now</span>
                      <span>₹{totalCost?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                {product.rental_agreement && (
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 max-h-28 overflow-y-auto border border-gray-200">
                    <p className="font-semibold mb-1">Rental Agreement</p>
                    {product.rental_agreement}
                  </div>
                )}

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5" checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-xs text-gray-600">
                    I agree to the rental agreement, will return the item in the same condition, and accept the ₹50/day late return penalty.
                  </span>
                </label>

                <button onClick={handleBook} disabled={booking || !agreedToTerms || days <= 0}
                  className="btn-primary w-full py-3 text-base">
                  {booking ? "Processing…" : `Request to Rent · ₹${totalCost?.toLocaleString("en-IN") || "—"}`}
                </button>

                <p className="text-xs text-center text-gray-400">
                  No charge until owner approves. Deposit refunded on return.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
