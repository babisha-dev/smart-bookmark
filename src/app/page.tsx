import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginButton from "@/components/LoginButton";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/bookmarks");
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Large decorative bookmark shapes */}
        <div className="absolute -top-20 -right-20 w-96 h-96 border border-ink-100 rounded-full opacity-40" />
        <div className="absolute -top-10 -right-10 w-72 h-72 border border-ink-100 rounded-full opacity-30" />
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-ink-900/3 rounded-full blur-3xl" />
        
        {/* Floating bookmark icons */}
        <div className="absolute top-32 right-1/4 opacity-6 text-ink-200 text-8xl font-display select-none" aria-hidden>
          §
        </div>
        <div className="absolute bottom-40 left-1/4 opacity-5 text-ink-200 text-7xl font-display select-none rotate-12" aria-hidden>
          ¶
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, #433a2f 79px, #433a2f 80px),
                              repeating-linear-gradient(90deg, transparent, transparent 79px, #433a2f 79px, #433a2f 80px)`,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 md:px-16">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-ink-900 flex items-center justify-center">
            <span className="text-cream text-xs font-display font-bold">F</span>
          </div>
          <span className="font-display font-semibold text-ink-900 text-lg tracking-tight">
            Folios
          </span>
        </div>
        <div className="text-ink-400 text-xs font-mono tracking-wider uppercase">
          Private Bookmarks
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-ink-200 bg-white/60 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-ink-500 text-xs font-mono tracking-widest uppercase">
              Real-time sync · Private · Yours
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl text-ink-900 leading-[1.05] mb-6 tracking-tight">
            Your reads,
            <br />
            <em className="font-display italic text-ink-500">beautifully</em>
            <br />
            organized.
          </h1>

          {/* Subtitle */}
          <p className="text-ink-500 text-lg md:text-xl font-body font-light leading-relaxed mb-12 max-w-md mx-auto">
            Save bookmarks privately. Access them instantly. 
            They sync in real‑time across all your tabs.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <LoginButton />
            <p className="text-ink-400 text-xs font-body">
              Sign in with Google — no password needed
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-16">
            {[
              { icon: "🔒", label: "Private to you" },
              { icon: "⚡", label: "Real-time sync" },
              { icon: "🗑️", label: "Easy delete" },
              { icon: "☁️", label: "Always available" },
            ].map((feat) => (
              <div
                key={feat.label}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-100 text-ink-600 text-xs font-body shadow-sm"
              >
                <span>{feat.icon}</span>
                <span>{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-ink-300 text-xs font-mono">
        Built with Next.js · Supabase · Tailwind CSS
      </footer>
    </main>
  );
}
