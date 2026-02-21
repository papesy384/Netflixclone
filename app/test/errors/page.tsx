"use client";

import { useState } from "react";
import Link from "next/link";
import ErrorBoundary from "@/app/components/ErrorBoundary";

function ThrowsOnClick() {
  const [shouldThrow, setShouldThrow] = useState(false);
  if (shouldThrow) throw new Error("Test error: click-triggered crash");
  return (
    <button
      type="button"
      onClick={() => setShouldThrow(true)}
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Trigger crash
    </button>
  );
}

export default function ErrorTestPage() {
  return (
    <div className="space-y-12 p-8">
      <div>
        <Link href="/" className="text-[#e50914] hover:underline">
          ← Back to home
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white">Error Handling Tests</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Error boundary (default fallback)</h2>
        <p className="text-sm text-white/70">
          Click to trigger a crash. The boundary shows &quot;Something went wrong&quot; with a Try
          again button.
        </p>
        <ErrorBoundary>
          <ThrowsOnClick />
        </ErrorBoundary>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">2. Error boundary (custom fallback)</h2>
        <p className="text-sm text-white/70">
          Click to trigger a crash. Custom fallback with reset button.
        </p>
        <ErrorBoundary
          fallback={(error, reset) => (
            <div className="rounded bg-amber-950/50 p-4">
              <p className="text-amber-200">Custom fallback: {error.message}</p>
              <button
                type="button"
                onClick={reset}
                className="mt-2 rounded bg-amber-600 px-3 py-1 text-sm text-white hover:bg-amber-700"
              >
                Reset
              </button>
            </div>
          )}
        >
          <ThrowsOnClick />
        </ErrorBoundary>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">3. Invalid room</h2>
        <Link
          href="/watch/invalid-room-id-12345"
          className="block rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20"
        >
          Open invalid room →
        </Link>
        <p className="text-sm text-white/50">
          Room won&apos;t exist in DB; VideoPlayer will create it or show sync error.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">4. Video error</h2>
        <Link
          href="/watch/test?v=invalidVideoId123"
          className="block rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20"
        >
          Open room with invalid video →
        </Link>
        <p className="text-sm text-white/50">
          VideoPlayer onError should show &quot;can&apos;t be played&quot; message.
        </p>
      </section>
    </div>
  );
}
