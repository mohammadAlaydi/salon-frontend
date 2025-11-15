/**
 * Booking Step 2: Staff Selection
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { usePublicStaff } from "@/hooks/booking/useBooking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

export default function BookingStaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  const { data: staffList, isLoading, error } = usePublicStaff(serviceId || undefined);

  if (!serviceId) {
    router.replace("/booking/services");
    return null;
  }

  const handleSelectStaff = (staffId: string) => {
    router.push(`/booking/time?serviceId=${serviceId}&staffId=${staffId}`);
  };

  const handleBack = () => {
    router.back();
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
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Button>
            <h1 className="font-heading text-3xl font-bold text-glownova-primary-dark mb-2">
              Choose Your Specialist
            </h1>
            <p className="text-muted-foreground">
              Select from our team of experienced professionals
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-glownova-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading staff...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-status-error/10 p-8 text-center">
            <p className="text-status-error">Failed to load staff</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page or try again later
            </p>
          </div>
        ) : !staffList || staffList.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <div className="mb-4 text-5xl">👥</div>
            <h3 className="text-xl font-semibold">No staff available</h3>
            <p className="mt-2 text-muted-foreground">
              Please check back later or select a different service
            </p>
            <Button onClick={handleBack} className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {staffList.map((item, index) => {
              const staff = item.staff;
              return (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full transition-all hover:shadow-elevated hover:-translate-y-1">
                    <CardHeader>
                      {/* Avatar */}
                      <div className="mb-4 flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 to-sage-200 text-4xl">
                          {staff.avatarUrl ? (
                            <img
                              src={staff.avatarUrl}
                              alt={staff.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            "👤"
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-center text-xl">{staff.name}</CardTitle>
                      
                      {/* Rating */}
                      {staff.rating && (
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{staff.rating.toFixed(1)}</span>
                        </div>
                      )}

                      {staff.bio && (
                        <CardDescription className="mt-3 text-center">
                          {staff.bio}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      {/* Skills */}
                      {staff.skills && staff.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {staff.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleSelectStaff(staff.id)}
                        className="w-full gap-2"
                      >
                        Select {staff.name.split(" ")[0]}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

