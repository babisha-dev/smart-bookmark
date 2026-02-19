import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookmarksClient from "@/components/BookmarksClient";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch initial bookmarks server-side
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <BookmarksClient
      initialBookmarks={bookmarks ?? []}
      user={{
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.full_name ?? user.email ?? "User",
        avatar: user.user_metadata?.avatar_url ?? null,
      }}
    />
  );
}
