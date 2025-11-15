"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const params = useParams();
  const salonSlug = params?.salonSlug as string;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href={`/${salonSlug}`} className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="font-heading text-xl font-bold text-glownova-primary">
              GLOWNOVA
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href={`/${salonSlug}/services`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-glownova-primary"
            >
              Services
            </Link>
            <Link
              href={`/${salonSlug}/staff`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-glownova-primary"
            >
              Our Team
            </Link>
            <Link
              href={`/${salonSlug}/book`}
              className="rounded-md bg-glownova-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-glownova-primary-dark"
            >
              Book Now
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-glownova-surface">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* About */}
            <div>
              <h3 className="mb-3 font-heading font-semibold text-glownova-primary">
                About Us
              </h3>
              <p className="text-sm text-muted-foreground">
                Experience luxury and professionalism at GLOWNOVA Demo Salon.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-3 font-heading font-semibold text-glownova-primary">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={`/${salonSlug}/services`}
                    className="text-muted-foreground hover:text-glownova-primary"
                  >
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${salonSlug}/staff`}
                    className="text-muted-foreground hover:text-glownova-primary"
                  >
                    Meet the Team
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${salonSlug}/book`}
                    className="text-muted-foreground hover:text-glownova-primary"
                  >
                    Book Appointment
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-3 font-heading font-semibold text-glownova-primary">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>123 Beauty Lane</li>
                <li>San Francisco, CA 94103</li>
                <li>+1 (555) 123-4567</li>
                <li>contact@demo-salon.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © 2024 GLOWNOVA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

