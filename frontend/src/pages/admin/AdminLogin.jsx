import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-ink via-slate-900 to-slate-800 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ShieldCheck size={26} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Authorized personnel only</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="input !pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input !pl-10"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-dark w-full !py-3">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link to="/" className="mt-5 block text-center text-sm text-muted hover:text-ink">
          Back to store
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;