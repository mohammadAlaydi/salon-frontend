/**
 * Admin login page
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/admin/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, authLoading, redirectPath, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data);
      toast.success("Welcome back!", {
        description: "You've successfully logged in.",
      });
      router.push(redirectPath);
    } catch (error: any) {
      toast.error("Login failed", {
        description: error?.status === 401
          ? "Invalid email or password. Please try again."
          : "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoAccount = () => {
    setValue("email", "admin@demo.local");
    setValue("password", "Password123!");
    toast.info("Demo credentials filled", {
      description: "Click 'Sign In' to continue.",
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🌸</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-glownova-bg px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold text-glownova-primary">
            GLOWNOVA
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg bg-white p-8 shadow-card dark:bg-glownova-surface">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-sm text-status-error" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <p className="text-sm text-status-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Account */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground dark:bg-glownova-surface">
                  Or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={useDemoAccount}
              disabled={isLoading}
            >
              Use Demo Account
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Demo: <code className="font-mono">admin@demo.local</code> /{" "}
              <code className="font-mono">Password123!</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © 2024 GLOWNOVA. All rights reserved.
        </p>
      </div>
    </div>
  );
}

