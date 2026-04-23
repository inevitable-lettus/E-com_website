import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What kinds of items can I rent on Use(Less)?",
    a: "Any household non-perishable, non-consumable item — cameras, tools, kitchen appliances, camping gear, furniture, sports equipment, and more. Consumables, food, and single-use items are not allowed.",
  },
  {
    q: "How does the payment work?",
    a: "Use(Less) uses a simulated wallet. Add funds to your wallet, and when you rent an item the rental cost plus security deposit is deducted. The deposit is returned to your wallet once the owner confirms the item is back in good condition.",
  },
  {
    q: "What is the security deposit?",
    a: "The security deposit is set by the item owner and is held in your wallet during the rental. It is refunded to you in full when the owner marks the item as returned. If there is damage beyond normal wear, a portion may be withheld.",
  },
  {
    q: "What happens if I return an item late?",
    a: "Late returns are charged at ₹50 per day beyond the agreed end date. This penalty is deducted from your wallet automatically when the owner confirms the return.",
  },
  {
    q: "Can I extend my rental period?",
    a: "Yes! Go to your renter dashboard, find the active rental, and click 'Request Extension'. Choose a new return date and submit. The owner will approve or decline the request.",
  },
  {
    q: "How does pickup and return work?",
    a: "Use(Less) is pickup-only. Once your rental is approved, coordinate with the owner via the in-app chat to arrange pickup location and time. Return is also handled directly between you and the owner.",
  },
  {
    q: "Is my ID proof required?",
    a: "Owners may require ID verification before handing over high-value items. You can upload your ID and address proof in your profile settings. Documents are kept private and only used for verification purposes.",
  },
  {
    q: "What if an item is damaged or lost?",
    a: "First, communicate with the owner via chat to resolve the issue. If the item is damaged, the security deposit may cover repair costs. In cases of dispute, contact us via the Contact page.",
  },
  {
    q: "How do reviews work?",
    a: "After a rental is completed, the renter can review the product and the owner, and the owner can review the renter. Reviews help build trust in the community.",
  },
  {
    q: "Is Use(Less) available across India?",
    a: "Currently Use(Less) is a locally-hosted demo. The platform is designed to work city-wide, with pickup coordination handled between users via chat.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500">Everything you need to know about Use(Less)</p>
      </div>

      <div className="space-y-2">
        {FAQS.map((f, i) => (
          <div key={i} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left flex items-center justify-between gap-4 p-5">
              <span className="font-medium text-gray-900">{f.q}</span>
              <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 card p-6 text-center bg-primary-50 border border-primary-100">
        <p className="text-gray-700 font-medium mb-1">Still have questions?</p>
        <p className="text-sm text-gray-500 mb-3">Reach out to us directly and we'll get back to you.</p>
        <a href="/contact" className="btn-primary text-sm">Contact Us</a>
      </div>
    </div>
  );
}
