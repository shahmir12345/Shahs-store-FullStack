import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, MapPin } from "lucide-react";
import api from "../api/axios";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container-page max-w-4xl py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-8">
      <h1 className="text-3xl font-extrabold">My Orders</h1>
      <p className="mt-1 text-muted">Track and review everything you have ordered</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {orders.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Package size={30} />
          </div>
          <p className="mt-4 text-lg font-semibold">You have no orders yet</p>
          <p className="mt-1 text-sm text-muted">When you place an order, it will show up here.</p>
          <Link to="/products" className="btn-primary mt-5">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {orders.map((order) => (
            <div key={order._id} className="card overflow-hidden border-slate-400 border-1">
              <div className="flex flex-col gap-3 border-b border-line bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-8 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Order</p>
                    <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Placed on</p>
                    <p className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Total</p>
                    <p className="font-semibold">Rs. {order.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 px-5 py-4 text-sm">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between gap-4">
                    <span className="min-w-0 truncate">
                      {item.name} <span className="text-muted">x {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 border-t border-line px-5 py-3 text-sm text-muted">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>
                  {order.shippingAddress.address}, {order.shippingAddress.city} |{" "}
                  {order.shippingAddress.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;