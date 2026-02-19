"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkCard from "./BookmarkCard";
import LogoutButton from "./LogoutButton";

type Bookmark = {
  id: string;
  url: string;
  title: string;
  user_id: string;
  created_at: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
};

type Props = {
  initialBookmarks: Bookmark[];
  user: User;
};

export default function BookmarksClient({ initialBookmarks, user }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) => {
            // Avoid duplicates
            if (prev.find((b) => b.id === payload.new.id)) return prev;
            return [payload.new as Bookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase]);

  const handleAdd = useCallback(
    async ({ url, title }: { url: string; title: string }) => {
      setIsAdding(true);
      try {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, title }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add bookmark");
        }
        // The real-time subscription will update the list
      } finally {
        setIsAdding(false);
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    setDeletingIds((prev) => new Set([...prev, id]));
    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete bookmark");
      }
      // The real-time subscription will update the list
    } catch (err) {
      console.error(err);
      // Remove from deleting set on error
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      searchQuery === "" ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen relative">
      {/* Subtle background lines */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, #433a2f 39px, #433a2f 40px)`,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-7 h-7 bg-ink-900 flex items-center justify-center">
              <span className="text-cream text-xs font-display font-bold">F</span>
            </div>
            <span className="font-display font-semibold text-ink-900 text-lg tracking-tight hidden sm:block">
              Folios
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search bookmarks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-ink-200 text-sm text-ink-900
                           font-body placeholder:text-ink-300 rounded-sm focus:outline-none 
                           focus:border-ink-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-ink-200 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center">
                <span className="text-cream text-xs font-mono font-medium">
                  {initials}
                </span>
              </div>
            )}
            <span className="text-ink-600 text-sm font-body hidden md:block truncate max-w-32">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Page title + count */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-ink-900 tracking-tight mb-1">
              Your Bookmarks
            </h1>
            <p className="text-ink-400 text-sm font-body">
              {bookmarks.length === 0
                ? "Nothing saved yet — start collecting"
                : `${bookmarks.length} saved ${
                    bookmarks.length === 1 ? "item" : "items"
                  }`}
            </p>
          </div>

          {/* Real-time indicator */}
          <div className="flex items-center gap-1.5 text-ink-400 text-xs font-mono">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="hidden sm:block">Live</span>
          </div>
        </div>

        {/* Add bookmark form */}
        <div className="mb-10">
          <AddBookmarkForm onAdd={handleAdd} isLoading={isAdding} />
        </div>

        {/* Divider */}
        {bookmarks.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-ink-100" />
            <span className="text-ink-300 text-xs font-mono tracking-widest uppercase">
              {searchQuery
                ? `${filteredBookmarks.length} result${filteredBookmarks.length !== 1 ? "s" : ""}`
                : "Collection"}
            </span>
            <div className="flex-1 h-px bg-ink-100" />
          </div>
        )}

        {/* Bookmark list */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-24">
            {bookmarks.length === 0 ? (
              <>
                <div className="text-5xl mb-4 opacity-30" aria-hidden>
                  📑
                </div>
                <p className="font-display text-xl text-ink-400 mb-2">
                  Your collection awaits
                </p>
                <p className="text-ink-300 text-sm font-body">
                  Add your first bookmark above to get started.
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4 opacity-30" aria-hidden>
                  🔍
                </div>
                <p className="font-display text-xl text-ink-400 mb-2">
                  No matches found
                </p>
                <p className="text-ink-300 text-sm font-body">
                  Try a different search term.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookmarks.map((bookmark, index) => (
              <div
                key={bookmark.id}
                className="animate-bookmark-in"
                style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
              >
                <BookmarkCard
                  bookmark={bookmark}
                  onDelete={handleDelete}
                  isDeleting={deletingIds.has(bookmark.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
