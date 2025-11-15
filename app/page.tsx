"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-glownova-bg flex items-center justify-center px-4">
      <main className="w-full max-w-3xl rounded-2xl bg-white shadow-card p-8 md:p-12">
        <header className="mb-8 text-center">
          <div className="mb-3 text-4xl">🌸</div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-glownova-primary">
            GLOWNOVA
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Multi-tenant salon management with a beautiful booking experience.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 mb-10">
          <div className="rounded-xl border border-border bg-glownova-surface/40 p-4">
            <h2 className="font-semibold mb-2">Admin</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage services, staff, customers, appointments, and reports.
            </p>
            <Link
              href="/admin/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-glownova-primary px-4 py-2 text-sm font-medium text-white hover:bg-glownova-primary-dark transition-colors"
            >
              Go to Admin Login
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-glownova-surface/40 p-4">
            <h2 className="font-semibold mb-2">Public Booking</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Let clients discover your services and book appointments online.
            </p>
            <Link
              href="/booking/services"
              className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-glownova-primary hover:bg-glownova-primary/10 transition-colors"
            >
              Start Booking
            </Link>
        </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground">
          Demo salon:{" "}
          <Link href="/demo-salon" className="underline hover:text-glownova-primary-dark">
            /demo-salon
          </Link>
        </footer>
      </main>
    </div>
  );
}
