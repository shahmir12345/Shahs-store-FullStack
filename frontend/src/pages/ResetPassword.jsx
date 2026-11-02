import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Check } from "lucide-react";
import api from "../api/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate("/login", { replace: true }), 2500);
    return () => clearTimeout(t);
  }, [done, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      await api.post("/users/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <div className="pop-in mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            <Check size={52} strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-green-600">Password updated</h1>
          <p className="mt-2 text-muted">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <img src="/logo.png" alt="Shah's Store" className="mb-6 h-14 w-14 object-contain" />
        <h1 className="text-3xl font-extrabold">Set a new password</h1>
        <p className="mt-2 text-muted">Choose a new password for your account.</p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}{" "}
            {error.includes("invalid or has expired") && (
              <Link to="/forgot-password" className="font-semibold underline">
                Request a new link
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">New password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input !pl-10 !pr-10"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat the password"
                className="input !pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;