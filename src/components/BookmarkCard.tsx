"use client";

import { useState } from "react";

type Bookmark = {
  id: string;
  url: string;
  title: string;
  user_id: string;
  created_at: string;
};

type Props = {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  try {
    const { protocol, hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${protocol}//${hostname}&sz=32`;
  } catch {
    return "";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function BookmarkCard({ bookmark, onDelete, isDeleting }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const domain = getDomain(bookmark.url);
  const faviconUrl = getFaviconUrl(bookmark.url);

  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete(bookmark.id);
    } else {
      setShowDeleteConfirm(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className={`group card flex items-start gap-4 p-4 transition-all duration-200
                  hover:shadow-md hover:border-ink-200 hover:-translate-y-0.5
                  ${isDeleting ? "opacity-40 pointer-events-none scale-98" : ""}
                  ${showDeleteConfirm ? "border-red-200 bg-red-50/30" : ""}`}
    >
      {/* Favicon / Icon */}
      <div className="flex-shrink-0 w-9 h-9 border border-ink-100 bg-ink-50 flex items-center justify-center overflow-hidden">
        {!faviconError && faviconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <span className="text-ink-300 text-xs font-mono font-bold uppercase">
            {domain.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-body font-medium text-ink-900 text-sm leading-snug 
                     hover:text-amber-600 transition-colors truncate mb-1"
        >
          {bookmark.title}
        </a>
        <div className="flex items-center gap-2">
          <span className="text-ink-400 text-xs font-mono truncate max-w-48 md:max-w-xs">
            {domain}
          </span>
          <span className="text-ink-200 text-xs">·</span>
          <time className="text-ink-400 text-xs font-mono flex-shrink-0">
            {formatDate(bookmark.created_at)}
          </time>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Visit link */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 flex items-center justify-center text-ink-400 
                     hover:text-ink-700 hover:bg-ink-50 transition-all"
          title="Open link"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={`w-7 h-7 flex items-center justify-center transition-all
                      ${showDeleteConfirm
                        ? "text-red-600 bg-red-100 hover:bg-red-200"
                        : "text-ink-400 hover:text-red-500 hover:bg-red-50"
                      }`}
          title={showDeleteConfirm ? "Click again to confirm delete" : "Delete bookmark"}
        >
          {isDeleting ? (
            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : showDeleteConfirm ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Delete confirm hint */}
      {showDeleteConfirm && (
        <div className="absolute right-2 -bottom-7 bg-red-600 text-white text-xs font-mono px-2 py-1 
                        rounded shadow-lg whitespace-nowrap z-10 animate-fade-in">
          Click again to confirm
        </div>
      )}
    </div>
  );
}
