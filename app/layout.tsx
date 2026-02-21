import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

export const metadata: Metadata = {
  title: "The Social Sofa",
  description: "Watch together in sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="pt-14">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
