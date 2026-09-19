import React, { useState } from "react";
import { QrCode, Barcode, ScanLine, Sparkles } from "lucide-react";
import QrGenerator from "./components/QrGenerator.jsx";
import BarcodeGenerator from "./components/BarcodeGenerator.jsx";
import Decoder from "./components/Decoder.jsx";

const TABS = [
  { id: "qr", label: "QR Code", icon: QrCode },
  { id: "barcode", label: "Barcode", icon: Barcode },
  { id: "decode", label: "Decode", icon: ScanLine },
];

export default function App() {
  const [tab, setTab] = useState("qr");

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <header className="relative border-b border-ink-700/60 bg-ink-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-indigo-600 shadow-lg shadow-accent-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">QR &amp; Barcode Studio</h1>
              <p className="text-xs text-slate-400">Generate &amp; decode — fully configurable</p>
            </div>
          </div>
          <nav className="flex gap-1 rounded-xl border border-ink-700 bg-ink-800/60 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-accent-500 text-white shadow-md shadow-accent-500/30"
                    : "text-slate-400 hover:bg-ink-700 hover:text-slate-200"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        {tab === "qr" && <QrGenerator />}
        {tab === "barcode" && <BarcodeGenerator />}
        {tab === "decode" && <Decoder />}
      </main>

      <footer className="relative mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-slate-500">
        Built with React, Express &amp; Node.js — ported from the Barcode/QR generation &amp; reading notebook.
      </footer>
    </div>
  );
}
