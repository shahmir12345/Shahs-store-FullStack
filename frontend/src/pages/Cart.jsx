import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { items, loading, updateQuantity, removeFromCart } = useCart();
  const [error, setError] = useState("");

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    setError("");
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    }
  };

  const removeItem = async (productId) => {
    setError("");
    try {
      await removeFromCart(productId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove");
    }
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <ShoppingBag size={36} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Looks like you have not added anything yet.</p>
        <Link to="/products" className="btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-extrabold">
        Your Cart <span className="text-lg font-medium text-muted">({totalItems} items)</span>
      </h1>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const p = item.product;
            return (
              <div key={p._id} className="card flex gap-4 p-4">
                <Link
                  to={`/products/${p._id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-28 sm:w-28"
                >
                  {p.image?.[0] ? (
                    <img src={p.image[0]} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs capitalize text-muted">{p.category}</p>
                      <Link to={`/products/${p._id}`} className="block truncate font-semibold hover:text-brand-600">
                        {p.name}
                      </Link>
                      <p className="text-sm text-muted">Rs. {p.price.toLocaleString()} each</p>
                    </div>
                    <button
                      onClick={() => removeItem(p._id)}
                      className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-line">
                      <button
                        onClick={() => updateQty(p._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-slate-50 disabled:opacity-40"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(p._id, item.quantity + 1)}
                        disabled={item.quantity >= p.stock}
                        className="p-2 hover:bg-slate-50 disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-extrabold">Rs. {(p.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card p-5">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal ({totalItems} items)</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-extrabold">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
            <button onClick={() => navigate("/checkout")} className="btn-primary mt-5 w-full !py-3">
              Checkout <ArrowRight size={18} />
            </button>
            <Link to="/products" className="mt-3 block text-center text-sm font-medium text-muted hover:text-ink">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;