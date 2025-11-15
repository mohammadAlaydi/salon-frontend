/**
 * Root login page - redirects to admin login
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-4xl">🌸</div>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
}

