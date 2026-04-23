import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

const CONDITION_COLOR = {
  Excellent: "bg-green-100 text-green-800",
  Good: "bg-blue-100 text-blue-800",
  Fair: "bg-yellow-100 text-yellow-800",
  Poor: "bg-red-100 text-red-800",
};

export default function ProductCard({ product }) {
  const image = product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`;
  const lowestPrice = [product.price_per_day, product.price_per_week, product.price_per_month]
    .filter(Boolean)
    .sort((a, b) => a - b)[0];
  const priceLabel = product.price_per_day ? "/day"
    : product.price_per_week ? "/week" : "/month";

  return (
    <Link to={`/products/${product.id}`} className="card group overflow-hidden hover:shadow-md transition-shadow block">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img src={image} alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product.title}</h3>
          <span className={`badge shrink-0 ${CONDITION_COLOR[product.condition] || "bg-gray-100 text-gray-600"}`}>
            {product.condition}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-600">
              ₹{parseFloat(lowestPrice).toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-gray-500">{priceLabel}</span>
          </div>
          {product.avg_rating && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-700">{product.avg_rating}</span>
              <span>({product.review_count})</span>
            </div>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-400">
          <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
            {product.category}
          </span>
          <span className="ml-auto">by {product.owner?.name}</span>
        </div>
      </div>
    </Link>
  );
}
