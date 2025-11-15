/**
 * Public Hero Component
 * Brand-aware hero section with salon name, tagline, and CTA
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Salon } from "@/lib/types/api";

interface HeroProps {
  salon: Salon;
  onBookNow: () => void;
}

export function Hero({ salon, onBookNow }: HeroProps) {
  const primaryColor = salon.branding?.primaryColor || "#E6A4B4";

  return (
    <div
      className="relative h-[600px] flex items-center justify-center text-white"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {salon.branding?.logoUrl && (
          <img
            src={salon.branding.logoUrl}
            alt={`${salon.name} logo`}
            className="h-24 mx-auto mb-8"
          />
        )}
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
          {salon.name}
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90">
          Your Destination for Beauty & Wellness
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={onBookNow}
            className="bg-white text-gray-900 hover:bg-white/90 text-lg px-8 py-6"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Book Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
          >
            View Services
          </Button>
        </div>
      </div>
    </div>
  );
}

