// components/QRCodeDisplay.tsx
"use client";

import QRCode from "react-qr-code";

interface QRCodeDisplayProps {
  value: string;
}

export default function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  return <QRCode value={value} />;
}
