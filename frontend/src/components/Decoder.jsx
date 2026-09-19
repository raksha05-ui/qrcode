import React, { useRef, useState, useEffect } from "react";
import { ScanLine, UploadCloud, Loader2, Copy, Check } from "lucide-react";
import { Panel, Button, ErrorBanner } from "./ui.jsx";

export default function Decoder() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [codes, setCodes] = useState([]);
  const [dims, setDims] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgElRef = useRef(null);

  // Draw the image + bounding boxes onto the canvas whenever results/image change
  useEffect(() => {
    if (!previewUrl || !dims) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = dims.width;
      canvas.height = dims.height;
      ctx.drawImage(img, 0, 0, dims.width, dims.height);

      ctx.lineWidth = Math.max(3, Math.round(dims.width / 250));
      ctx.strokeStyle = "#ff3b30";
      ctx.font = `${Math.max(16, Math.round(dims.width / 40))}px sans-serif`;
      ctx.fillStyle = "#22c55e";

      codes.forEach((c) => {
        const { x, y, width, height } = c.boundingBox;
        ctx.strokeRect(x, y, width, height);
        ctx.fillText(c.text, x, Math.max(y - 12, 18));
      });
    };
    img.src = previewUrl;
  }, [previewUrl, dims, codes]);

  const handleFile = async (f) => {
    if (!f) return;
    setError("");
    setMessage("");
    setCodes([]);
    setDims(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", f);
      const res = await fetch("/api/decode", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to decode image");
      setCodes(json.codes || []);
      setDims({ width: json.width, height: json.height });
      if (!json.codes || json.codes.length === 0) setMessage(json.message || "No code detected.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Panel title="Upload Image" subtitle="Detects QR codes & barcodes, draws bounding boxes" icon={UploadCloud}>
        <ErrorBanner message={error} />
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ink-600 bg-ink-800/40 p-6 text-center transition hover:border-accent-500 hover:bg-ink-800/70"
        >
          {previewUrl && !dims ? (
            <img src={previewUrl} alt="Uploaded preview" className="max-h-64 rounded-lg shadow-lg" />
          ) : !previewUrl ? (
            <>
              <UploadCloud size={32} className="text-slate-500" />
              <p className="text-sm text-slate-400">Drag &amp; drop an image, or click to browse</p>
              <p className="text-xs text-slate-600">PNG, JPG up to 10MB</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">Scanned — see annotated result on the right</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" /> Scanning image...
          </div>
        )}
      </Panel>

      <Panel title="Detection Results" icon={ScanLine}>
        {dims ? (
          <canvas ref={canvasRef} className="mb-4 w-full rounded-lg border border-ink-700" />
        ) : (
          <div className="mb-4 flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-ink-600 bg-ink-800/40">
            <p className="text-sm text-slate-500">{message || "Results will appear here"}</p>
          </div>
        )}

        {codes.length > 0 && (
          <div className="space-y-3">
            {codes.map((c, idx) => (
              <div key={idx} className="rounded-lg border border-ink-700 bg-ink-800/60 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-400">
                    {c.format}
                  </span>
                  <Button variant="ghost" className="!px-2 !py-1" onClick={() => copyText(c.text, idx)}>
                    {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </div>
                <p className="break-all font-mono text-sm text-slate-200">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
