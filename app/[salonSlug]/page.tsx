/**
 * Public Salon Landing Page
 * Brand-aware landing with hero, services, staff, and book CTA
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { Hero } from "@/components/public/Hero";
import { ServicesGrid } from "@/components/public/ServicesGrid";
import { StaffShowcase } from "@/components/public/StaffShowcase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSalon, usePublicServices, usePublicStaff } from "@/hooks/api/usePublicSalon";
import { Phone, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";

export default function SalonLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.salonSlug as string;

  const { data: salon, isLoading: isLoadingSalon } = usePublicSalon(slug);
  const { data: services = [], isLoading: isLoadingServices } = usePublicServices(slug);
  const { data: staff = [], isLoading: isLoadingStaff } = usePublicStaff(slug);

  if (isLoadingSalon) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-96 w-full" />
        <div className="container mx-auto px-4 py-12 space-y-12">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Salon Not Found</h1>
          <p className="text-muted-foreground">
            The salon you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Apply salon branding
  const primaryColor = salon.branding?.primaryColor || "#E6A4B4";

  return (
    <div className="min-h-screen">
      {/* Apply branding via CSS custom properties */}
      <style jsx global>{`
        :root {
          --salon-primary: ${primaryColor};
        }
      `}</style>

      <Hero salon={salon} onBookNow={() => router.push(`/${slug}/book`)} />

      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Services Section */}
        <section id="services">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our range of professional beauty and wellness services
            </p>
          </div>
          <ServicesGrid services={services} isLoading={isLoadingServices} />
        </section>

        {/* Staff Section */}
        {staff.length > 0 && (
          <section id="team">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our experienced professionals are here to make you look and feel amazing
              </p>
            </div>
            <StaffShowcase staff={staff} isLoading={isLoadingStaff} />
          </section>
        )}

        {/* About & Contact Section */}
        <section id="contact" className="py-16 bg-muted/30 rounded-lg">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-4">About {salon.name}</h3>
                <p className="text-muted-foreground mb-6">
                  Welcome to {salon.name}, your destination for exceptional beauty services.
                  Our dedicated team is committed to providing you with a relaxing and
                  rejuvenating experience.
                </p>
                <Button
                  size="lg"
                  style={{ backgroundColor: primaryColor }}
                  className="text-white"
                  onClick={() => router.push(`/${slug}/book`)}
                >
                  Book an Appointment
                </Button>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Visit Us</h3>
                <div className="space-y-4">
                  {salon.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">{salon.address}</p>
                      </div>
                    </div>
                  )}
                  {salon.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href={`tel:${salon.phone}`}
                          className="text-muted-foreground hover:underline"
                        >
                          {salon.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {salon.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${salon.email}`}
                          className="text-muted-foreground hover:underline"
                        >
                          {salon.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {salon.name}. All rights reserved.</p>
            <p className="mt-2">Powered by GLOWNOVA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

