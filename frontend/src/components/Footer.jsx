import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Use<span className="text-primary-600">(Less)</span>
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Rent household items from your neighbours instead of buying. Save money, reduce waste, build community.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-primary-600">
              <Leaf size={14} />
              <span className="text-xs font-medium">Sustainable renting for a better tomorrow</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/browse" className="hover:text-gray-900">Browse Items</Link></li>
              <li><Link to="/list" className="hover:text-gray-900">List an Item</Link></li>
              <li><Link to="/dashboard/renter" className="hover:text-gray-900">My Rentals</Link></li>
              <li><Link to="/dashboard/owner" className="hover:text-gray-900">My Listings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/faq" className="hover:text-gray-900">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Use(Less). Built with ♥ for university challenge.
        </div>
      </div>
    </footer>
  );
}
