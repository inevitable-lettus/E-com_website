import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemo = async (e) => {
    e.preventDefault();
    if (!name || !email) { toast.error("Enter name and email"); return; }
    setLoading(true);
    try {
      await demoLogin(name, email);
      toast.success(`Welcome, ${name}!`);
      navigate(from, { replace: true });
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Use<span className="text-primary-600">(Less)</span>
          </h1>
          <p className="text-gray-500">Sign in to rent or list items</p>
        </div>

        <div className="card p-8 space-y-5">
          <a href="/api/auth/google/login"
            className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">or demo login (no Google setup needed)</span>
            </div>
          </div>

          <form onSubmit={handleDemo} className="space-y-4">
            <div>
              <label className="label">Your Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma" required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in…" : "Sign in with Demo Account"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400">
            Demo login creates a new account if the email is not registered. ₹500 starting balance included.
          </p>
        </div>
      </div>
    </div>
  );
}
