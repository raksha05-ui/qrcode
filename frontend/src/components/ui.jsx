import React from "react";

export function Panel({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-ink-700 bg-ink-900/70 p-6 shadow-xl shadow-black/20 ${className}`}>
      {title && (
        <div className="mb-5 flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
              <Icon size={18} />
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500 ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500 ${props.className || ""}`}
    >
      {props.children}
    </select>
  );
}

export function Slider({ value, ...props }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        value={value}
        {...props}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-600 accent-accent-500"
      />
      <span className="w-10 shrink-0 text-right text-xs font-mono text-slate-300">{value}</span>
    </div>
  );
}

export function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-800 px-2 py-1.5">
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="h-6 w-8 cursor-pointer rounded border-none bg-transparent"
      />
      <span className="font-mono text-xs text-slate-400">{value}</span>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary:
      "bg-gradient-to-br from-accent-500 to-indigo-600 text-white shadow-lg shadow-accent-500/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-ink-700 text-slate-200 hover:bg-ink-600",
    ghost: "bg-transparent text-slate-300 hover:bg-ink-800 border border-ink-600",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
      {message}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-ink-600 bg-ink-800 px-3 py-2.5">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-accent-500" : "bg-ink-600"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
