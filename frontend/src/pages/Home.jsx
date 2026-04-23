import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Leaf, Shield, MessageCircle, Wallet } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { name: "Electronics", emoji: "📷" },
  { name: "Kitchen", emoji: "🍳" },
  { name: "Tools", emoji: "🔧" },
  { name: "Sports", emoji: "🏊" },
  { name: "Outdoor", emoji: "⛺" },
  { name: "Furniture", emoji: "🪑" },
  { name: "Clothing", emoji: "👗" },
  { name: "Other", emoji: "📦" },
];

const HOW_IT_WORKS = [
  { icon: Search, title: "Find what you need", desc: "Browse hundreds of household items listed by people near you." },
  { icon: MessageCircle, title: "Chat with the owner", desc: "Ask questions, agree on pickup details, and confirm availability." },
  { icon: Wallet, title: "Pay securely via wallet", desc: "Funds are held safely. Deposit is returned when you return the item." },
  { icon: Leaf, title: "Return & review", desc: "Return the item on time, leave a review, and help the community grow." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/products?limit=6").then((r) => setFeatured(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm mb-6">
              <Leaf size={14} /> Sustainable renting for everyone
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Rent instead of buy.<br />
              <span className="text-primary-200">Save money. Reduce waste.</span>
            </h1>
            <p className="text-primary-100 text-lg mb-8">
              Use(Less) connects you with neighbours who have the household items you need — from cameras to camping tents — available to rent for a day, week, or month.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Link to="/browse"
                className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-center">
                Browse Items
              </Link>
              <Link to="/list"
                className="bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-400 transition-colors text-center border border-primary-400">
                List an Item
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick search */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/browse?search=${search}`; }}
            className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for cameras, drills, tents…"
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Browse by Category</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={`/browse?category=${c.name}`}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors group">
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Recently Listed</h2>
          <Link to="/browse" className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Loading items…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How Use(Less) works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <step.icon size={22} className="text-primary-600" />
                </div>
                <div className="text-xs font-bold text-primary-600 mb-1">STEP {i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white text-center py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Have something to rent out?</h2>
        <p className="text-primary-100 mb-6 max-w-md mx-auto">
          Earn money from items collecting dust at home. Listing is free and takes under 5 minutes.
        </p>
        <Link to="/list" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
          List your first item →
        </Link>
      </section>
    </div>
  );
}
