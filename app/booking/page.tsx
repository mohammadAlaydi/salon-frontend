/**
 * Booking Root - Redirects to services selection
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/booking/services");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-4xl">🌸</div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}

