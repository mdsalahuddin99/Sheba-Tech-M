"use client";

import { useState } from "react";
import { createSystemUpdate } from "@/server/actions/systemUpdates";
import { PageHeader } from "@/shared/components/PageHeader";

export function UpdateForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
  const [version, setVersion] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [features, setFeatures] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // Helper to parse multiline text into array of strings
    const parseTextarea = (text: string) => 
      text.split("\n").map(line => line.trim()).filter(Boolean);

    try {
      await createSystemUpdate({
        version,
        date: date,
        features: parseTextarea(features),
      });
      setSuccess(true);
      setVersion("");
      setFeatures("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to submit system update");
    } finally {
      setLoading(false);
    }
  };

  const renderTextarea = (
    label: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        className="w-full rounded border px-3 py-2 h-24 resize-y"
        value={value}
        onChange={(e) => setter(e.target.value)}
        placeholder={`Paste your ${label.toLowerCase()} here, one per line...`}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <PageHeader title="New System Update" />
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          System update created successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Version</label>
            <input
              type="text"
              required
              className="w-full rounded border px-3 py-2"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v1.2.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full rounded border px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {renderTextarea("Features", features, setFeatures)}

        <div className="mt-6 flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Publish Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
