import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, Lock } from "lucide-react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, loading, refreshCart } = useCart();
  const [form, setForm] = useState({ address: "", city: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/orders", { shippingAddress: form });
      await refreshCart();
      navigate("/my-orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (loading) {
    return <p className="container-page py-10 text-muted">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-lg font-semibold">Your cart is empty. Add some products first.</p>
        <Link to="/products" className="btn-primary mt-4">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-extrabold">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Shipping address</h2>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Address</label>
                <input
                  name="address"
                  placeholder="House no, street, area"
                  value={form.address}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">City</label>
                  <input
                    name="city"
                    placeholder="e.g. Peshawar"
                    value={form.city}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="03XX XXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Payment method</h2>
            <div className="mt-4 flex items-center gap-3 rounded-lg border-2 border-brand-600 bg-brand-50 p-4">
              <Banknote className="text-brand-600" />
              <div>
                <p className="font-semibold">Cash on Delivery</p>
                <p className="text-sm text-muted">Pay when your order arrives</p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5 text-base">
            <Lock size={18} /> {submitting ? "Placing order..." : `Place order · Rs. ${total.toLocaleString()}`}
          </button>
        </form>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card p-5">
            <h2 className="text-lg font-bold">Order summary</h2>
            <div className="mt-4 space-y-4">
              {items.map((i) => (
                <div key={i.product._id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {i.product.image?.[0] && (
                      <img src={i.product.image[0]} alt={i.product.name} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute -right-0 -top-0 rounded-bl-lg bg-ink px-1.5 text-xs font-bold text-white">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.product.name}</p>
                    <p className="text-sm text-muted">
                      Rs. {(i.product.price * i.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;