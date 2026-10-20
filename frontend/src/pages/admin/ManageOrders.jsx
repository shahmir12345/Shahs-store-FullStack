import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

const statuses = ["pending", "shipped", "delivered", "cancelled"];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    setError("");
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrders(orders.map((o) => (o._id === id ? { ...o, status: data.status } : o)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const visibleOrders = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-extrabold">Orders</h1>
      <p className="mb-6 mt-1 text-muted">{orders.length} orders in total</p>
      <AdminNav />

      <div className="mb-5 flex flex-wrap gap-2">
        {["", ...statuses].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
              filter === s ? "bg-ink text-white" : "border border-line bg-white hover:bg-slate-50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-muted">Loading...</p>}
      {!loading && visibleOrders.length === 0 && (
        <div className="card p-10 text-center text-muted">No orders found</div>
      )}

      <div className="space-y-5">
        {visibleOrders.map((order) => (
          <div key={order._id} className="card overflow-hidden border-1 border-slate-400">
            <div className="flex flex-col gap-3 border-b border-line bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  #{order._id.slice(-6).toUpperCase()}{" "}
                  <span className="font-normal text-muted">
                    · {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </p>
                <p className="text-sm text-muted">
                  {order.user?.name || "Deleted user"} {order.user?.email && `(${order.user.email})`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="input !w-auto !py-1.5 capitalize"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 px-5 py-4 text-sm">
              {order.items.map((item) => (
                <div key={item._id} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">
                    {item.name} <span className="text-muted">x {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1 border-t border-line px-5 py-3 text-sm sm:flex-row sm:justify-between">
              <p className="text-muted">
                {order.shippingAddress.address}, {order.shippingAddress.city} | {order.shippingAddress.phone}
              </p>
              <p className="font-extrabold">Total: Rs. {order.totalPrice.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageOrders;