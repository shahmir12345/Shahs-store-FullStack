import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const VARIANTS = {
  login: {
    heading: [
      { text: "Good to " },
      { text: "see you again.", className: "text-brand-500" },
    ],
    text: "Log in to track your orders, manage your cart and pick up right where you left off.",
    speed: 38,
    cursorClass: "bg-brand-500",
  },
  signup: {
    heading: [
      { text: "Start your " },
      { text: "shopping journey.", className: "text-brand-500" },
    ],
    text: "Create a free account in a minute and enjoy fast delivery, easy checkout and order tracking.",
    speed: 52,
    cursorClass: "bg-white",
  },
};

/* Ek line jo khud likhti hui nazar aati hai */
const TypeLine = ({ segments, speed, delay = 0, run, onDone, showCursor, cursorClass }) => {
  const total = segments.reduce((n, s) => n + s.text.length, 0);
  const full = segments.map((s) => s.text).join("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (prefersReduced()) {
      setCount(total);
      onDone?.();
      return;
    }
    let i = 0;
    let timer;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= total) {
          clearInterval(timer);
          onDone?.();
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps

  let left = count;
  const typed = segments.map((s, i) => {
    const part = s.text.slice(0, Math.max(left, 0));
    left -= s.text.length;
    return (
      <span key={i} className={s.className}>
        {part}
      </span>
    );
  });

  return (
    <span className="relative block">
      <span className="sr-only">{full}</span>

      {/* Poora text invisible: jagah pehle se ghera rehti hai, layout kood nahi karta */}
      <span className="invisible block" aria-hidden="true">
        {segments.map((s, i) => (
          <span key={i} className={s.className}>
            {s.text}
          </span>
        ))}
      </span>

      {/* Asli typed text isi ke upar */}
      <span className="absolute inset-0 block" aria-hidden="true">
        {typed}
        {showCursor && <span className={`type-cursor ${cursorClass}`} />}
      </span>
    </span>
  );
};

/* Logo ka 3D hissa */
const LogoStage = ({ variant }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (variant !== "login" || prefersReduced()) return;

    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const onMove = (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      setTilt({ x: -clamp(dy) * 18, y: clamp(dx) * 22 });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [variant]);

  const imgClass =
    "relative mx-auto max-h-[26vh] w-full object-contain drop-shadow-[0_25px_35px_rgba(249,115,22,0.35)] lg:max-h-[45vh]";

  return (
    <Link
      to="/"
      className="block w-full max-w-[9.5rem] sm:max-w-[12rem] lg:max-w-sm xl:max-w-md"
    >
      <div ref={ref} className="relative">
        <div
          className={`absolute inset-4 rounded-full bg-brand-600/30 blur-3xl lg:inset-8 ${
            variant === "signup" ? "glow-pulse" : ""
          }`}
        />

        {variant === "login" ? (
          <div className="logo-float">
            <img
              src="/logo.png"
              alt="Shah's Store"
              className={imgClass}
              style={{
                transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 0.15s ease-out",
              }}
            />
          </div>
        ) : (
          <div className="logo-spin-in">
            <div className="logo-swing">
              <img src="/logo.png" alt="Shah's Store" className={imgClass} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

const AuthLayout = ({ title, subtitle, children, footer, variant = "login" }) => {
  const cfg = VARIANTS[variant];
  const [step, setStep] = useState(0);

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Brand panel: mobile par upar ka chhota banner, laptop par left side */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-ink via-slate-900 to-slate-800 px-6 py-8 text-center text-white lg:px-8 lg:py-10">
        <LogoStage variant={variant} />

        <h2 className="mt-5 w-full max-w-md text-2xl font-extrabold leading-tight sm:text-3xl lg:mt-8 lg:text-4xl">
          <TypeLine
            key={`${variant}-h`}
            segments={cfg.heading}
            speed={cfg.speed}
            delay={variant === "signup" ? 1000 : 500}
            run
            onDone={() => setStep(1)}
            showCursor={step === 0}
            cursorClass={cfg.cursorClass}
          />
        </h2>

        <p className="mt-3 w-full max-w-md text-sm text-slate-300 lg:mt-4 lg:text-base">
          <TypeLine
            key={`${variant}-p`}
            segments={[{ text: cfg.text }]}
            speed={Math.round(cfg.speed / 2)}
            delay={250}
            run={step >= 1}
            showCursor={step >= 1}
            cursorClass={cfg.cursorClass}
          />
        </p>

        <p className="mt-10 hidden text-sm text-slate-500 lg:block">
          © {new Date().getFullYear()} Shah's Store
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-10 lg:py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;