/**
 * Booking Step 1: Service Selection
 */

"use client";

import { useRouter } from "next/navigation";
import { usePublicServices } from "@/hooks/booking/useBooking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function BookingServicesPage() {
  const router = useRouter();
  const { data: services, isLoading, error } = usePublicServices();

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getCategoryIcon = (serviceName: string): string => {
    const name = serviceName.toLowerCase();
    if (name.includes("hair") || name.includes("cut") || name.includes("color") || name.includes("balayage")) {
      return "💇";
    }
    if (name.includes("manicure") || name.includes("pedicure") || name.includes("nail")) {
      return "💅";
    }
    if (name.includes("facial") || name.includes("skincare")) {
      return "🧖";
    }
    if (name.includes("massage")) {
      return "💆";
    }
    if (name.includes("wax")) {
      return "✨";
    }
    if (name.includes("makeup")) {
      return "💄";
    }
    return "🌸";
  };

  const handleSelectService = (serviceId: string) => {
    router.push(`/booking/staff?serviceId=${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-glownova-bg">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-100 to-sage-100 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-heading text-4xl font-bold text-glownova-primary-dark mb-3">
              GLOWNOVA
            </h1>
            <p className="text-lg text-muted-foreground">Select a service to get started</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-glownova-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading services...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-status-error/10 p-8 text-center">
            <p className="text-status-error">Failed to load services</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page or try again later
            </p>
          </div>
        ) : !services || services.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <div className="mb-4 text-5xl">🌸</div>
            <h3 className="text-xl font-semibold">No services available</h3>
            <p className="mt-2 text-muted-foreground">
              Please check back later for available services
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full transition-all hover:shadow-elevated hover:-translate-y-1">
                  <CardHeader>
                    <div className="mb-3 text-4xl">{getCategoryIcon(service.name)}</div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    {service.description && (
                      <CardDescription className="mt-2">{service.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>⏱️ {service.durationMinutes} minutes</span>
                      <span className="text-lg font-semibold text-glownova-primary">
                        {formatPrice(service.priceCents)}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleSelectService(service.id)}
                      className="w-full gap-2"
                    >
                      Select Service
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

