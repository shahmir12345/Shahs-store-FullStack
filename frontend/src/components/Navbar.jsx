import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-brand-600 ${
      isActive ? "text-brand-600" : "text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold tracking-tight p-3">
          Shah's <span className="text-brand-600">Store</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/products" className={linkClass}>Shop</NavLink>
          {user && <NavLink to="/my-orders" className={linkClass}>My Orders</NavLink>}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative rounded-lg p-2 hover:bg-slate-100"
            aria-label="Cart"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[13px] font-bold text-black">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted">Hi, {user.name.split(" ")[0]}</span>
                <button onClick={handleLogout} className="btn-outline !px-3" aria-label="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
               <div className="flex gap-2">
                <Link to="/login" className="btn-outline">Login</Link>
                <Link to="/signup" className="btn-primary px-2">Sign up</Link>
               </div>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-lg p-2 hover:bg-slate-100"
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-white">
          <div className="container-page flex flex-col gap-4 py-4">
            <NavLink to="/" end onClick={close} className={linkClass}>Home</NavLink>
            <NavLink to="/products" onClick={close} className={linkClass}>Shop</NavLink>
            {user && <NavLink to="/my-orders" onClick={close} className={linkClass}>My Orders</NavLink>}
            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={close} className={linkClass}>Admin</NavLink>
            )}
            {user ? (
              <button onClick={handleLogout} className="btn-outline w-full">
                <LogOut size={16} /> Logout ({user.name.split(" ")[0]})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={close} className="btn-outline flex-1">Login</Link>
                <Link to="/signup" onClick={close} className="btn-primary flex-1">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;


// sticky top-0 z-50: scroll karne par navbar upar chipka rehta hai, aur z-50 se baqi content ke upar rehta hai. bg-white/90 backdrop-blur: halka transparent shishe jaisa effect.
// NavLink: Link jaisa hi hai, bas ye khud jaanta hai ke abhi active page kaunsa hai. className mein function dete hain jo isActive leta hai, aur active link orange ho jata hai. end Home ke liye zaroori hai, warna / har page par active dikhata.
// ShoppingBag, Menu, X: lucide ke icons, size se bara chhota hota hai.
// Cart icon par relative aur badge par absolute -top-0.5 -right-0.5: badge icon ke kone par chipak jata hai. Yahi cart count wala CartContext ka kamaal hai.
// hidden md:flex aur md:hidden: laptop aur mobile ke liye alag hisse, jaisa pehle seekha.
// user?.role === "admin": user null ho tab bhi crash nahi.
// user.name.split(" ")[0]: poore naam ka sirf pehla lafz (“Ali Khan” se “Ali”).
// -> !px-3: ! Tailwind mein “important” hai, btn-outline ka padding is chhote icon button par override karta hai.
// aria-label: icon wale buttons ko screen readers ke liye naam deta hai.
// Mobile par cart icon hamesha bahar nazar aata hai (e-commerce mein zaroori), baqi links menu mein.