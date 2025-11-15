/**
 * Salon-specific booking route - redirects to booking flow
 */

"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SalonBookPage() {
  const router = useRouter();
  const params = useParams();
  const salonSlug = params.salonSlug as string;

  useEffect(() => {
    // Redirect to the booking flow
    router.replace("/booking/services");
  }, [router, salonSlug]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-4xl">🌸</div>
        <p className="text-muted-foreground">Redirecting to booking...</p>
      </div>
    </div>
  );
}

