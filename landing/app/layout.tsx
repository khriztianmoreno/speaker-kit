import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "speaker-kit — Speaker mode for Next.js",
  description:
    "Drop-in SpeakerView and AudienceView for Next.js. Real-time sync via BroadcastChannel + Supabase. Your slides stay as plain React components.",
  openGraph: {
    title: "speaker-kit",
    description: "Speaker mode for Next.js presentations.",
    url: "https://speaker-kit.khriztianmoreno.dev",
    siteName: "speaker-kit",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
