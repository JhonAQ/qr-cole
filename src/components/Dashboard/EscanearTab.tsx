"use client";

import React from "react";
import { EnhancedQRScanner } from "@/components/Scanner";

interface EscanearTabProps {
  onBackToDashboard?: () => void;
}

export default function EscanearTab({ onBackToDashboard }: EscanearTabProps) {
  return (
    <div className="p-4">
      <EnhancedQRScanner />
    </div>
  );
}
