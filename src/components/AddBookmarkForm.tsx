"use client";

import { useState, useRef } from "react";

type Props = {
  onAdd: (data: { url: string; title: string }) => Promise<void>;
  isLoading: boolean;
};

export default function AddBookmarkForm({ onAdd, isLoading }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim() || !title.trim()) {
      setError("Both URL and title are required.");
      return;
    }

    // Basic URL check
    try {
      new URL(url.trim());
    } catch {
      setError("Please enter a valid URL (include https://).");
      return;
    }

    try {
      await onAdd({ url: url.trim(), title: title.trim() });
      setUrl("");
      setTitle("");
      setIsExpanded(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 transition-all duration-300">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 flex items-center justify-center bg-amber-500/10 flex-shrink-0">
          <svg
            className="w-3 h-3 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-ink-700 text-sm font-body font-medium">
          Add Bookmark
        </span>
      </div>

      <div
        className={`grid transition-all duration-300 ${
          isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
        } overflow-hidden`}
      >
        <div className="min-h-0">
          <div className="space-y-3 pb-1">
            <div>
              <label
                htmlFor="bookmark-title"
                className="block text-xs font-mono text-ink-400 tracking-widest uppercase mb-1.5"
              >
                Title
              </label>
              <input
                id="bookmark-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Getting Started with Next.js"
                className="input-field"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="bookmark-url"
                className="block text-xs font-mono text-ink-400 tracking-widest uppercase mb-1.5"
              >
                URL
              </label>
              <input
                id="bookmark-url"
                ref={urlRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="input-field font-mono text-xs"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed state: single input to expand */}
      {!isExpanded && (
        <button
          type="button"
          onFocus={handleFocus}
          onClick={handleFocus}
          className="w-full mt-3 px-4 py-2.5 border border-dashed border-ink-200 text-ink-400 
                     text-sm font-body text-left hover:border-ink-300 hover:text-ink-600 
                     transition-all duration-200 rounded-sm"
        >
          Paste a URL or type a title to begin…
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-xs font-body bg-red-50 px-3 py-2 rounded-sm border border-red-100">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Actions (only when expanded) */}
      {isExpanded && (
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={isLoading || !url.trim() || !title.trim()}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Bookmark
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setError(null);
            }}
            disabled={isLoading}
            className="btn-ghost"
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  );
}
