"use client";

import React from "react";
import "../page.css";
/**
 * FragmentCard displays a single fragment's metadata and content.
 * @param {{ fragment: Object }} props
 */
export default function FragmentCard({ fragment }) {
  if (!fragment) return <p>No fragment provided.</p>;

  const { id, ownerId, type, size, created, updated, data } = fragment;

  const isText = type.startsWith("text/");

  return (
    <div className="border rounded-xl p-4 shadow-sm my-4 bg-white">
      <h2 className="text-lg font-bold mb-2">Fragment Card</h2>

      <div className="text-sm text-gray-700 space-y-1">
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

      <div className="mt-4">
        <h3 className="font-semibold">Data:</h3>
        {isText ? (
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap break-words">
            {data}
          </pre>
        ) : (
          <p className="text-red-600">
            Binary content (base64): {data?.slice(0, 60)}...
          </p>
        )}
      </div>
    </div>
  );
}
