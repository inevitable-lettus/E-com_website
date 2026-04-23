import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Package, MessageCircle, Wallet, User, LogOut, ChevronDown, PlusCircle } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDdOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              Use<span className="text-primary-600">(Less)</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/browse" className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-primary-600" : "text-gray-600 hover:text-gray-900"}`
            }>Browse</NavLink>
            <NavLink to="/faq" className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-primary-600" : "text-gray-600 hover:text-gray-900"}`
            }>FAQ</NavLink>
            <NavLink to="/contact" className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-primary-600" : "text-gray-600 hover:text-gray-900"}`
            }>Contact</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/list" className="btn-primary flex items-center gap-1.5 text-sm">
                  <PlusCircle size={16} /> List Item
                </Link>
                <Link to="/chat" className="p-2 text-gray-500 hover:text-gray-900 relative">
                  <MessageCircle size={20} />
                </Link>
                <Link to="/wallet" className="p-2 text-gray-500 hover:text-gray-900">
                  <Wallet size={20} />
                </Link>
                <div className="relative">
                  <button onClick={() => setDdOpen(!ddOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
                    {user.profile_pic
                      ? <img src={user.profile_pic} className="w-8 h-8 rounded-full object-cover" alt="" />
                      : <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                          {user.name[0]}
                        </div>}
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {ddOpen && (
                    <div className="absolute right-0 mt-2 w-52 card shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setDdOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/dashboard/owner" onClick={() => setDdOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Package size={15} /> My Listings
                      </Link>
                      <Link to="/dashboard/renter" onClick={() => setDdOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Package size={15} /> My Rentals
                      </Link>
                      <Link to="/wallet" onClick={() => setDdOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Wallet size={15} /> Wallet · ₹{parseFloat(user.wallet_balance).toLocaleString("en-IN")}
                      </Link>
                      <button onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Sign in</Link>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          <Link to="/browse" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Browse</Link>
          <Link to="/faq" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">FAQ</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Contact</Link>
          {user ? (
            <>
              <Link to="/list" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-primary-600">+ List an Item</Link>
              <Link to="/dashboard/owner" onClick={() => setOpen(false)} className="block py-2 text-sm text-gray-700">My Listings</Link>
              <Link to="/dashboard/renter" onClick={() => setOpen(false)} className="block py-2 text-sm text-gray-700">My Rentals</Link>
              <Link to="/wallet" onClick={() => setOpen(false)} className="block py-2 text-sm text-gray-700">Wallet · ₹{parseFloat(user.wallet_balance).toLocaleString("en-IN")}</Link>
              <Link to="/chat" onClick={() => setOpen(false)} className="block py-2 text-sm text-gray-700">Messages</Link>
              <Link to="/profile" onClick={() => setOpen(false)} className="block py-2 text-sm text-gray-700">Profile</Link>
              <button onClick={handleLogout} className="block py-2 text-sm text-red-600">Log out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-primary-600">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
