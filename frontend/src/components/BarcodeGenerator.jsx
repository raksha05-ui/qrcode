import React, { useState } from "react";
import { Barcode as BarcodeIcon, Download, Loader2, SlidersHorizontal } from "lucide-react";
import { Panel, Field, TextInput, Select, Slider, ColorInput, Button, Toggle, ErrorBanner } from "./ui.jsx";

const TYPES = [
  { value: "ean8", label: "EAN-8 (8 digits)", placeholder: "73513537" },
  { value: "ean13", label: "EAN-13 (13 digits)", placeholder: "5901234123457" },
  { value: "ean14", label: "EAN-14 / GS1-14 (14 digits)", placeholder: "10059012341234" },
  { value: "upca", label: "UPC-A (12 digits)", placeholder: "036000291452" },
  { value: "jan", label: "JAN (13 digits)", placeholder: "4901234567894" },
  { value: "isbn10", label: "ISBN-10", placeholder: "0306406152" },
  { value: "isbn13", label: "ISBN-13", placeholder: "9780306406157" },
  { value: "issn", label: "ISSN (8 digits)", placeholder: "20493630" },
  { value: "code39", label: "Code 39 (variable)", placeholder: "CODE39" },
  { value: "code128", label: "Code 128 (variable)", placeholder: "Code128Example" },
  { value: "pzn", label: "PZN (7–8 digits)", placeholder: "1234567" },
];

export default function BarcodeGenerator() {
  const [type, setType] = useState("code128");
  const [data, setData] = useState("Code128Example");
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(10);
  const [includetext, setIncludetext] = useState(true);
  const [barColor, setBarColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [rotate, setRotate] = useState("N");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeType = TYPES.find((t) => t.value === type);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/barcode/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          type,
          scale,
          height,
          includetext,
          barColor,
          backgroundColor,
          rotate,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate barcode");
      setImage(json.image);
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
    a.download = `barcode-${type}.png`;
    a.click();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel title="Barcode Configuration" subtitle="Covers every symbology from the notebook" icon={SlidersHorizontal}>
        <ErrorBanner message={error} />

        <Field label="Barcode type / standard">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Data to encode" hint={`Example: ${activeType?.placeholder}`}>
          <TextInput value={data} onChange={(e) => setData(e.target.value)} placeholder={activeType?.placeholder} />
        </Field>

        <Field label="Scale (module width)">
          <Slider min={1} max={10} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
        </Field>

        <Field label="Bar height (mm)">
          <Slider min={5} max={40} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Bar color">
            <ColorInput value={barColor} onChange={(e) => setBarColor(e.target.value)} />
          </Field>
          <Field label="Background color">
            <ColorInput value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </Field>
        </div>

        <Field label="Rotation">
          <Select value={rotate} onChange={(e) => setRotate(e.target.value)}>
            <option value="N">None</option>
            <option value="R">Rotate right 90°</option>
            <option value="L">Rotate left 90°</option>
            <option value="I">Inverted 180°</option>
          </Select>
        </Field>

        <div className="mb-4">
          <Toggle checked={includetext} onChange={setIncludetext} label="Show human-readable text below bars" />
        </div>

        <Button onClick={generate} disabled={loading || !data.trim()} className="mt-2 w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <BarcodeIcon size={16} />}
          Generate Barcode
        </Button>
      </Panel>

      <Panel title="Preview" icon={BarcodeIcon}>
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-ink-600 bg-ink-800/40 p-6">
          {image ? (
            <img src={image} alt="Generated barcode" className="max-h-72 max-w-full rounded-lg bg-white p-3 shadow-lg" />
          ) : (
            <p className="text-sm text-slate-500">Your barcode will appear here</p>
          )}
        </div>
        <Button onClick={download} disabled={!image} variant="secondary" className="mt-4 w-full">
          <Download size={16} />
          Download PNG
        </Button>
      </Panel>
    </div>
  );
}
