# Folios — Smart Bookmark App

A private, real-time bookmark manager built with **Next.js 15** (App Router), **Supabase** (Auth, Database, Realtime), and **Tailwind CSS**.

🔗 **Live URL**: _[your Vercel URL here]_  
📦 **Repo**: _[your GitHub URL here]_

---

## Features

- **Google OAuth** — Sign in with Google, no email/password required
- **Private bookmarks** — Row Level Security ensures users only see their own data
- **Real-time sync** — Add a bookmark in one tab and it instantly appears in another
- **Delete** — Two-click confirmation prevents accidental deletion
- **Search** — Filter bookmarks by title or URL instantly
- **Favicon** — Automatically fetches site favicons for visual recognition

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 15 (App Router)           |
| Language    | TypeScript                        |
| Auth        | Supabase Auth (Google OAuth)      |
| Database    | Supabase (PostgreSQL)             |
| Realtime    | Supabase Realtime                 |
| Styling     | Tailwind CSS                      |
| Deployment  | Vercel                            |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account
- A Google Cloud project with OAuth credentials

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Providers → Google** and enable Google OAuth:
   - Add your Google Client ID and Client Secret
   - Set the **Redirect URL** shown in Supabase as an authorized redirect URI in your Google Cloud Console
4. Go to **Database → Replication** and enable the `bookmarks` table for realtime (or the SQL migration does this automatically)

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Both values are in your Supabase project: **Settings → API**.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and add the environment variables in the Vercel dashboard.

After deploying, add your Vercel URL to **Supabase → Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── bookmarks/
│   │       ├── route.ts          # GET + POST /api/bookmarks
│   │       └── [id]/route.ts     # DELETE /api/bookmarks/:id
│   ├── auth/
│   │   └── callback/route.ts     # OAuth callback handler
│   ├── bookmarks/
│   │   └── page.tsx              # Protected bookmarks page (Server Component)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing page (redirects if logged in)
├── components/
│   ├── AddBookmarkForm.tsx        # Form with expand animation
│   ├── BookmarkCard.tsx           # Card with delete confirm flow
│   ├── BookmarksClient.tsx        # Main client component + realtime subscription
│   ├── LoginButton.tsx            # Google OAuth trigger
│   └── LogoutButton.tsx          # Sign out
├── lib/
│   └── supabase/
│       ├── client.ts              # Browser client (@supabase/ssr)
│       └── server.ts             # Server client (@supabase/ssr)
└── middleware.ts                  # Session refresh + route protection
```

---

## Problems Encountered & Solutions

### 1. Cookies and server/client Supabase separation

**Problem**: Supabase's new `@supabase/ssr` package requires separate client instances for browser vs. server. Using the wrong one caused session issues — the server couldn't read the user's session.

**Solution**: Created two separate utility files:
- `src/lib/supabase/client.ts` — uses `createBrowserClient` for client components
- `src/lib/supabase/server.ts` — uses `createServerClient` with `next/headers` cookies for Server Components and Route Handlers

### 2. Middleware session refresh required

**Problem**: Without middleware, the Next.js edge runtime couldn't refresh expired Supabase sessions, causing logged-in users to get redirected to the login page after their token expired.

**Solution**: Added `src/middleware.ts` that calls `supabase.auth.getUser()` on every request, which automatically refreshes the session token if it's expired before the request hits any Server Component.

### 3. Real-time duplicate inserts

**Problem**: When the current user adds a bookmark via the API, the server inserts the row AND the Supabase Realtime subscription fires an INSERT event. This caused the bookmark to appear twice in the list.

**Solution**: In the realtime INSERT handler, check if the bookmark ID already exists in local state before prepending it:
```ts
setBookmarks((prev) => {
  if (prev.find((b) => b.id === payload.new.id)) return prev;
  return [payload.new as Bookmark, ...prev];
});
```

### 4. Row Level Security (RLS) for privacy

**Problem**: By default, all Supabase rows are accessible by any authenticated user with the anon key. Without RLS, User A could query User B's bookmarks.

**Solution**: Enabled RLS on the `bookmarks` table and wrote three policies (SELECT, INSERT, DELETE) that check `auth.uid() = user_id`. The API routes also double-check `user_id` in their queries as a defense-in-depth measure.

### 5. OAuth redirect URL in production

**Problem**: The Google OAuth redirect worked locally (`localhost:3000`) but after deploying to Vercel, the callback URL didn't match the allowed redirect URIs in Supabase or Google Cloud Console.

**Solution**:
- Added the production Vercel URL to **Google Cloud Console → Authorized redirect URIs**
- Added the URL to **Supabase → Authentication → Redirect URLs** as `https://your-app.vercel.app/auth/callback`
- Used `x-forwarded-host` header detection in the auth callback route to correctly reconstruct the origin URL in production

### 6. Next.js 15 `params` is now a Promise

**Problem**: In Next.js 15, the `params` object in dynamic route handlers (e.g., `[id]/route.ts`) is now a `Promise`, not a plain object. Accessing `params.id` directly caused a TypeScript error and runtime warning.

**Solution**: Updated the route handler signature to `async` and awaited params:
```ts
const { id } = await params;
```

---

## Database Schema

```sql
CREATE TABLE bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  title      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

With RLS policies ensuring users can only access their own rows.
