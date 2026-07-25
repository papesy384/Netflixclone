import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import RegisterSW from "./components/RegisterSW";

export const metadata: Metadata = {
  title: "The Social Sofa",
  description: "Watch together in sync. Free. Invite anyone with a link.",
  applicationName: "The Social Sofa",
  appleWebApp: {
    capable: true,
    title: "Social Sofa",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#E50914",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RegisterSW />
        <Navbar />
        <main className="pt-14">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
