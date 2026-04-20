import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export function QRCodeDisplay({ value, size = 200, fgColor = "#0F4C81", bgColor = "#ffffff", className }: QRCodeProps) {
  // We use a ref to target the exact canvas element when they click download
  const qrRef = useRef<HTMLDivElement>(null);

  // --- THE DOWNLOAD FUNCTION ---
  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Convert the canvas into a high-quality PNG image URL
    const pngUrl = canvas.toDataURL("image/png");

    // Create a fake invisible link, click it automatically, and remove it
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "QR_Code_PREM_PROM.png"; // The name of the downloaded file
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Safety guard: Return a blank box if the link hasn't loaded yet
  if (!value) return <div className={`bg-gray-100 animate-pulse ${className}`} style={{ width: size, height: size }} />;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* The actual QR Code inside the ref container */}
      <div ref={qrRef} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <QRCodeCanvas
          value={value}
          size={size}
          fgColor={fgColor}
          bgColor={bgColor}
          level="M"
          marginSize={4}
        />
      </div>

      {/* The Quality of Life Download Button */}
      <button
        onClick={downloadQR}
        type="button"
        className="text-sm font-semibold text-[#0F4C81] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
      >
        Download QR Image
      </button>
    </div>
  );
}
