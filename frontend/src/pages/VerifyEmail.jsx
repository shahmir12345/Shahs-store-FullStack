import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Check, MailCheck } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LENGTH = 6;

const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const email = useLocation().state?.email;

//   Array(6).fill("") ka matlab 6 elements ki array banao aur har element ko empty string se fill kar do.
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [error, setError] = useState("");
//   Ye success messages show karne ke liye hai.
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
//   verfied section ke liye
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(60);
//   useRef aisi value ya DOM element ka reference rakh sakta hai jise access karna ho, lekin jiske change hone par component ko re-render karwana zaroori na ho. In references ke through hum kisi input par focus kar sakte hain.
  const inputs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (verified) {
      const t = setTimeout(() => navigate("/", { replace: true }), 2000);
      return () => clearTimeout(t);
    }
  }, [verified, navigate]);

  if (!email) return <Navigate to="/signup" replace />;

  const submit = async (code) => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await verifyEmail(email, code);
      setVerified(true);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      setDigits(Array(LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

//   Input box mein digits enter karna
  const handleChange = (i, value) => {
    // Sirf digit allow karna
    const d = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    // Jis index par user ne type kiya, uski value update kar do.
    next[i] = d;
    setDigits(next);
    // Next box par focus, Agar digit enter hui hai aur current box last box nahi hai, to next box par focus kar do.
    if (d && i < LENGTH - 1) inputs.current[i + 1]?.focus();
    // every(Boolean) check karta hai ke array ke saare elements filled hain ya nahi.
    // join("") array ko ek string mein convert karta hai.
    // Ab ye OTP submit() ko pass ho jayega.
    if (next.every(Boolean)) submit(next.join(""));
  };

  const handleKeyDown = (i, e) => {
    // Check karta hai ke user ne Backspace press kiya hai. && Check karta hai ke current input empty hai. && Check karta hai ke hum first box par nahi hain.
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };
    // Copy-paste functionality
  const handlePaste = (e) => {
    // User ne jo text copy kiya hai woh mil jayega.Non-digit characters remove ho jayenge.Agar exactly 6 digits nahi hain, to function stop ho jayega.
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (text.length !== LENGTH) return;
    // Browser ka normal paste behaviour rokna zaroori hai, kyunki hum khud saare boxes update kar rahe hain.
    e.preventDefault();
    setDigits(text.split(""));
    submit(text);
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    try {
      await api.post("/users/resend-otp", { email });
      setInfo("A new code has been sent to your email.");
      setCooldown(60);
      setDigits(Array(LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch (err) {
      const wait = err.response?.data?.retryAfter;
      if (wait) setCooldown(wait);
      setError(err.response?.data?.message || "Could not resend code");
    }
  };

  if (verified) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <div className="pop-in mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            <Check size={52} strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-green-600">Verified</h1>
          <p className="mt-2 text-muted">Your email has been verified. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-slate-200">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 border border-1">
          <MailCheck size={30} />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">Verify your email</h1>
        <p className="mt-2 text-muted">
          We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>
        </p>

        {info && <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">{info}</p>}

        <div className="mt-6 flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
            //   Ye har input element ka reference inputs.current array mein save kar raha hai.
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              disabled={loading}
              autoFocus={i === 0}
              className="h-12 w-10 rounded-lg border border-1 bg-white text-center text-xl font-bold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:h-14 sm:w-12"
            />
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          Did not get the code?{" "}
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ) : (
            <button onClick={handleResend} className="font-semibold text-brand-600 hover:underline">
              Resend code
            </button>
          )}
        </p>
        <p className="mt-2 text-xs text-muted">Check your spam folder too. The code expires in 10 minutes.</p>
      </div>
    </div>
  );
};

export default VerifyEmail;