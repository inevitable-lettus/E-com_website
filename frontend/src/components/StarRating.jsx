import { Star } from "lucide-react";

export default function StarRating({ value, onChange, size = 24 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange?.(i)}>
          <Star size={size}
            className={`transition-colors ${i <= value ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
        </button>
      ))}
    </div>
  );
}
