"use client"

import { useEffect } from "react"

export default function AdCard() {

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.log("Adsense error", err)
    }
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">

      <p className="text-[10px] text-gray-400 mb-2">
        PUBLICIDAD
      </p>

      {/* 🔥 ADSENSE RECTÁNGULO (MEJOR INGRESO) */}
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          height: "250px"
        }}
        data-ad-client="ca-pub-XXXXXXXXXXXX"   // ⚠️ CAMBIA ESTO
        data-ad-slot="1234567890"              // ⚠️ CAMBIA ESTO
        data-ad-format="rectangle"
        data-full-width-responsive="true"
      />

    </div>
  )
}