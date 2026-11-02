import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Check } from "lucide-react";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <img src="/logo.png" alt="Shah's Store" className="mb-6 h-14 w-14 object-contain" />

        {sent ? (
          <div className="text-center">
            <div className="pop-in mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
              <Check size={44} strokeWidth={3} />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold">Check your email</h1>
            <p className="mt-2 text-muted">
              If <span className="font-semibold text-ink">{email}</span> is registered, we sent a
              password reset link. It expires in 15 minutes.
            </p>
            <p className="mt-2 text-xs text-muted">Check your spam folder too.</p>
            <Link to="/login" className="btn-outline mt-6">Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold">Forgot password?</h1>
            <p className="mt-2 text-muted">
              Enter your email and we will send you a link to reset your password.
            </p>

            {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input !pl-10"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <Link to="/login" className="mt-5 block text-center text-sm text-muted hover:text-ink">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;