"use client";

import React, { useState } from "react";
import "../page.css";
import { convertFragment } from "../api";

const SUPPORTED_CONVERSIONS = {
  "text/plain": ["text/plain"],
  "text/markdown": ["text/markdown", "text/html", "text/plain"],
  "text/html": ["text/html", "text/plain"],
  "text/csv": ["text/csv", "text/plain", "application/json"],
  "application/json": ["application/json", "text/plain"],
  "application/yaml": ["application/yaml", "text/plain"],
  "image/png": [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/avif",
  ],
  "image/jpeg": [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ],
  "image/webp": [
    "image/webp",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/avif",
  ],
  "image/avif": [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
    "image/gif",
  ],
  "image/gif": [
    "image/gif",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
  ],
};

const EXT_TO_TYPE = {
  "text/plain": "txt",
  "text/markdown": "md",
  "text/html": "html",
  "text/csv": "csv",
  "application/json": "json",
  "application/yaml": "yaml",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export default function FragmentCard({
  fragment,
  isActive,
  onActivate,
  onClose,
  onDelete,
  user,
}) {
  const [conversionValue, setConversionValue] = useState("text/plain");
  if (!fragment) return <p>No fragment provided.</p>;

  const { id, ownerId, type, size, created, updated, data } = fragment;
  const isText = type.startsWith("text/");

  async function handleConvert() {
    console.log(conversionValue);
    const { data, contentType } = await convertFragment(
      user,
      id,
      EXT_TO_TYPE[conversionValue]
    );

    // Create a Blob (handles both text and binary)
    const blob =
      typeof data === "string"
        ? new Blob([data], { type: contentType })
        : new Blob([data.buffer || data], { type: contentType });

    // Create a temporary download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.${EXT_TO_TYPE[conversionValue]}`; // file name and extension
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={!isActive ? onActivate : undefined}
      onKeyDown={(e) => {
        if (!isActive && (e.key === "Enter" || e.key === " ")) onActivate();
      }}
      className={`fragment-card${isActive ? " active" : ""}`}
    >
      {isActive && (
        <button
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="fragment-card__close"
        >
          ×
        </button>
      )}

      <h2 className="fragment-card__title">Fragment Card</h2>

      <div className="fragment-card__meta">
        <p>
          <strong>ID:</strong> {id}
        </p>
        <p>
          <strong>Owner ID:</strong> {ownerId}
        </p>
        <p>
          <strong>Type:</strong> {type}
        </p>
        <p>
          <strong>Size:</strong> {size} bytes
        </p>
        <p>
          <strong>Created:</strong> {new Date(created).toLocaleString()}
        </p>
        <p>
          <strong>Updated:</strong> {new Date(updated).toLocaleString()}
        </p>
      </div>

      <div className="fragment-card__data">
        <h3 className="fragment-card__subtitle">Data:</h3>
        {isText ? (
          <pre className="fragment-card__pre">{data}</pre>
        ) : (
          <p className="fragment-card__binary">
            Binary content (base64): {data?.slice(0, 60)}...
          </p>
        )}
      </div>

      {isActive && (
        <div className="fragment-card__actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this fragment? This cannot be undone.")) {
                onDelete?.();
              }
            }}
            className="btn btn-danger"
          >
            Delete
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>

          <select
            className="fragment-card__select"
            onChange={(e) => {
              setConversionValue(e.target.value);
            }}
          >
            {SUPPORTED_CONVERSIONS[type]?.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button onClick={handleConvert}>Convert</button>
        </div>
      )}
    </div>
  );
}
