"use client";

import React from "react";
import QRScanner from "@/components/QRScanner";
import { Scan } from "lucide-react";

interface EscanearTabProps {
  onBackToDashboard?: () => void;
}

export default function EscanearTab({ onBackToDashboard }: EscanearTabProps) {
  return (
    <div className="space-y-6">


      {/* Escáner QR */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <QRScanner />
      </div>
    </div>
  );
}
