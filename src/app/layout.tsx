import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Folios — Smart Bookmark Manager",
  description: "Save and organize your bookmarks privately and beautifully.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
