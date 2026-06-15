"use client";
import { useState } from "react";

export default function TestPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 20 }}>Test interactivitate</h1>
      <button
        onClick={() => alert("FUNCTIONEAZA!")}
        style={{
          padding: "20px 40px",
          fontSize: 20,
          fontWeight: 700,
          background: "#7c3aed",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          display: "block",
          marginBottom: 20,
          width: "100%",
        }}
      >
        APASĂ AICI (test)
      </button>
      <a
        href="/shop"
        style={{
          padding: "20px 40px",
          fontSize: 20,
          fontWeight: 700,
          background: "#16a34a",
          color: "#fff",
          borderRadius: 12,
          display: "block",
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        LINK SIMPLU (test)
      </a>
    </div>
  );
}
