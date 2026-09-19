# QR & Barcode Studio

A full-stack, fully-configurable QR code / barcode generator and decoder — a React + Express + Node.js port of the *Barcode & QR Generation and Reading* notebook.

## Features

**Generate QR codes** — every parameter from `qrcode.QRCode()` in the notebook is exposed in the UI:
- Data (URL / text / contact info / app link)
- Error correction level (L / M / Q / H)
- Version (1–40, or auto-fit)
- Box size (scale) and border (margin)
- Foreground / background color
- Output as PNG or SVG

**Generate barcodes** — every symbology covered in the notebook:
- EAN-8, EAN-13, EAN-14 (GS1-14), UPC-A, JAN, ISBN-10, ISBN-13, ISSN, Code 39, Code 128, PZN
- Configurable scale, bar height, colors, rotation, human-readable text toggle

**Decode** — upload any image containing a QR code or barcode:
- Detects and decodes the code (mirrors the `pyzbar` decode cells)
- Draws a bounding box + label over the detected code (mirrors the `cv2.rectangle` / `cv2.putText` cell), rendered live in the browser
- Copy decoded text to clipboard

## Tech stack

- **Backend:** Node.js, Express, `qrcode`, `bwip-js` (barcode generation), `@zxing/library` (decoding), `jimp` (pure-JS image reading — no native build tools required), `multer`
- **Frontend:** React 18, Vite, Tailwind CSS, `lucide-react`

## Project structure

```
qr-barcode-studio/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── qrcode.js       # POST /api/qrcode/generate
│   │   ├── barcode.js      # POST /api/barcode/generate
│   │   └── decode.js       # POST /api/decode
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── QrGenerator.jsx
    │       ├── BarcodeGenerator.jsx
    │       ├── Decoder.jsx
    │       └── ui.jsx
    └── package.json
```

## Setup

### 1. Backend

```bash
cd backend
npm install
npm start        # runs on http://localhost:5000
# or: npm run dev   (nodemon, auto-restart)
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` requests to the backend on port 5000 (see `frontend/vite.config.js`), so no CORS setup is needed in development.

### 3. Production build

```bash
cd frontend
npm run build     # outputs to frontend/dist
```

Serve `frontend/dist` with any static host (or add `express.static` to `backend/server.js`), pointing API calls at your deployed backend URL.

## API reference

### `POST /api/qrcode/generate`
```json
{
  "data": "https://example.com",
  "errorCorrectionLevel": "H",
  "version": null,
  "scale": 10,
  "margin": 4,
  "darkColor": "#000000",
  "lightColor": "#ffffff",
  "format": "png"
}
```
Returns `{ "image": "data:image/png;base64,..." }` (or raw SVG text if `format: "svg"`).

### `POST /api/barcode/generate`
```json
{
  "data": "5901234123457",
  "type": "ean13",
  "scale": 3,
  "height": 10,
  "includetext": true,
  "barColor": "#000000",
  "backgroundColor": "#ffffff",
  "rotate": "N"
}
```
`type` is one of: `ean8`, `ean13`, `ean14`, `upca`, `jan`, `isbn10`, `isbn13`, `issn`, `code39`, `code128`, `pzn`.
Returns `{ "image": "data:image/png;base64,..." }`.

### `POST /api/decode`
`multipart/form-data` with field `image`.
Returns:
```json
{
  "codes": [
    { "text": "https://example.com", "format": "QR_CODE", "boundingBox": { "x": 65, "y": 65, "width": 240, "height": 240 } }
  ],
  "width": 370,
  "height": 370
}
```

