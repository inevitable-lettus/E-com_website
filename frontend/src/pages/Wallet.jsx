import { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ArrowUpCircle, ArrowDownCircle, Plus } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/wallet/transactions").then((r) => setTransactions(r.data));
  }, []);

  const addFunds = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setLoading(true);
    try {
      await api.post("/wallet/add-funds", { amount: amt });
      toast.success(`₹${amt.toLocaleString("en-IN")} added to wallet`);
      setAmount("");
      const [txns] = await Promise.all([api.get("/wallet/transactions"), refreshUser()]);
      setTransactions(txns.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to add funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wallet</h1>

      <div className="card p-8 text-center mb-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl">
        <p className="text-sm text-primary-200 mb-1">Available Balance</p>
        <p className="text-5xl font-bold">₹{parseFloat(user?.wallet_balance || 0).toLocaleString("en-IN")}</p>
        <p className="text-xs text-primary-200 mt-2">Simulated wallet · Demo mode</p>
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Add Funds</h2>
        <div className="flex gap-2 flex-wrap">
          {QUICK_AMOUNTS.map((a) => (
            <button key={a} onClick={() => setAmount(String(a))}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${amount === String(a) ? "border-primary-600 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              ₹{a.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
            <input type="number" className="input pl-8" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount" min="1" max="100000" />
          </div>
          <button onClick={addFunds} disabled={loading || !amount}
            className="btn-primary flex items-center gap-1.5">
            <Plus size={16} /> {loading ? "Adding…" : "Add Funds"}
          </button>
        </div>
        <p className="text-xs text-gray-400">This is a simulated wallet. No real money is involved.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`p-2 rounded-full ${t.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                  {t.type === "credit"
                    ? <ArrowUpCircle size={18} className="text-green-600" />
                    : <ArrowDownCircle size={18} className="text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">{format(new Date(t.created_at), "d MMM yyyy, h:mm a")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold text-sm ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "credit" ? "+" : "-"}₹{parseFloat(t.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">₹{parseFloat(t.balance_after).toLocaleString("en-IN")} bal.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
