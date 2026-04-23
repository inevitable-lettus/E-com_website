import { Star } from "lucide-react";
import { format } from "date-fns";

export default function ReviewCard({ review }) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold">
          {review.reviewer?.name?.[0] || "?"}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{review.reviewer?.name || "Anonymous"}</p>
          <p className="text-xs text-gray-400">{format(new Date(review.created_at), "d MMM yyyy")}</p>
        </div>
        <div className="ml-auto flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={14}
              className={i <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
          ))}
        </div>
      </div>
      {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
    </div>
  );
}
