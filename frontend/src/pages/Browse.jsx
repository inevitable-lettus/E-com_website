import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["Electronics", "Furniture", "Kitchen", "Tools", "Sports", "Outdoor", "Clothing", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const condition = params.get("condition") || "";
  const minPrice = params.get("min_price") || "";
  const maxPrice = params.get("max_price") || "";

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  const clearAll = () => setParams({});

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (category) q.set("category", category);
    if (condition) q.set("condition", condition);
    if (minPrice) q.set("min_price", minPrice);
    if (maxPrice) q.set("max_price", maxPrice);
    api.get(`/products?${q}`).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [search, category, condition, minPrice, maxPrice]);

  const hasFilters = search || category || condition || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="Search items…"
            className="input pl-10"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2">
          <SlidersHorizontal size={16} /> Filters
          {hasFilters && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
        </button>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setParam("category", e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select className="input" value={condition} onChange={(e) => setParam("condition", e.target.value)}>
              <option value="">Any Condition</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Min Price/Day (₹)</label>
            <input type="number" className="input" value={minPrice}
              onChange={(e) => setParam("min_price", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">Max Price/Day (₹)</label>
            <input type="number" className="input" value={maxPrice}
              onChange={(e) => setParam("max_price", e.target.value)} placeholder="Any" />
          </div>
        </div>
      )}

      {category && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Showing:</span>
          <span className="badge bg-primary-100 text-primary-800">{category} <button onClick={() => setParam("category", "")} className="ml-1">×</button></span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} item{products.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
