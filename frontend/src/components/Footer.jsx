import { Link } from "react-router-dom";
import { Copyright } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="mt-16 bg-ink text-slate-300">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-2xl font-extrabold text-white">
            My<span className="text-brand-500">Store</span>
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Quality products, honest prices, delivered to your door.
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            <li><Link to="/my-orders" className="hover:text-white">My Orders</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Account</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/signup" className="hover:text-white">Sign up</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Contact</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>support@Shah's_store.com</li>
            <li>+92 317 6775852</li>
            <li>Peshawar, Pakistan</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 flex justify-center items-center">
      <Copyright size={13}/>{new Date().getFullYear()} MyStore. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;