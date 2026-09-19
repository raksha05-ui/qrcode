import React, { useState } from "react";
import { QrCode, Download, Loader2, SlidersHorizontal } from "lucide-react";
import { Panel, Field, TextInput, Select, Slider, ColorInput, Button, ErrorBanner } from "./ui.jsx";

const ERROR_LEVELS = [
  { value: "L", label: "L — recovers ~7%" },
  { value: "M", label: "M — recovers ~15% (default)" },
  { value: "Q", label: "Q — recovers ~25%" },
  { value: "H", label: "H — recovers ~30% (best)" },
];

export default function QrGenerator() {
  const [data, setData] = useState("https://www.anthropic.com");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("H");
  const [version, setVersion] = useState(""); // auto by default
  const [scale, setScale] = useState(10); // box_size
  const [margin, setMargin] = useState(4); // border
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [format, setFormat] = useState("png");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/qrcode/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          errorCorrectionLevel,
          version: version || undefined,
          scale,
          margin,
          darkColor,
          lightColor,
          format,
        }),
      });
      if (format === "svg") {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to generate QR code");
        const svgText = await res.text();
        setImage(`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`);
      } else {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to generate QR code");
        setImage(json.image);
      }
    } catch (e) {
      setError(e.message);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = `qrcode.${format}`;
    a.click();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel title="QR Code Configuration" subtitle="Mirrors qrcode.QRCode() parameters" icon={SlidersHorizontal}>
        <ErrorBanner message={error} />

        <Field label="Data to encode" hint="URL, text, contact info, app link, etc.">
          <TextInput
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="https://example.com"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Error correction level" hint="Higher = more damage-resistant">
            <Select value={errorCorrectionLevel} onChange={(e) => setErrorCorrectionLevel(e.target.value)}>
              {ERROR_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Version" hint="1–40, blank = auto-fit">
            <TextInput
              type="number"
              min={1}
              max={40}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="auto"
            />
          </Field>
        </div>

        <Field label="Box size (scale)" hint="Pixels per module">
          <Slider min={1} max={20} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
        </Field>

        <Field label="Border (margin)" hint="Minimum recommended: 4">
          <Slider min={0} max={10} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Foreground color">
            <ColorInput value={darkColor} onChange={(e) => setDarkColor(e.target.value)} />
          </Field>
          <Field label="Background color">
            <ColorInput value={lightColor} onChange={(e) => setLightColor(e.target.value)} />
          </Field>
        </div>

        <Field label="Output format">
          <Select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </Select>
        </Field>

        <Button onClick={generate} disabled={loading || !data.trim()} className="mt-2 w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
          Generate QR Code
        </Button>
      </Panel>

      <Panel title="Preview" icon={QrCode}>
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-ink-600 bg-ink-800/40 p-6">
          {image ? (
            <img src={image} alt="Generated QR code" className="max-h-72 rounded-lg bg-white p-3 shadow-lg" />
          ) : (
            <p className="text-sm text-slate-500">Your QR code will appear here</p>
          )}
        </div>
        <Button onClick={download} disabled={!image} variant="secondary" className="mt-4 w-full">
          <Download size={16} />
          Download {format.toUpperCase()}
        </Button>
      </Panel>
    </div>
  );
}
