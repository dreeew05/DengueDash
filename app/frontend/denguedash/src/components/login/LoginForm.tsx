"use client";

import type React from "react";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@shadcn/components/ui/button";
import { Card, CardContent, CardFooter } from "@shadcn/components/ui/card";
import { Input } from "@shadcn/components/ui/input";
import { Label } from "@shadcn/components/ui/label";
import { UserLoggedIn } from "@/interfaces/auth/user-auth.interface";
import authService from "@/services/auth.service";
import { MyUserInterface } from "@/interfaces/account/user-interface";
import { UserContext } from "@/contexts/UserContext";

export function LoginForm() {
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // useContext takes time to update, so we need to use useEffect to check if the user is saved to context
    if (user?.role === "Admin") {
      router.push("/user/admin/accounts/manage");
    } else if (user?.role === "Encoder") {
      router.push("/user/encoder/analytics/dashboard");
    }
  }, [user, router]);

  const loginUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const email = (event.target as HTMLFormElement).email.value;
    const password = (event.target as HTMLFormElement).password.value;

    try {
      const loginResponse: UserLoggedIn = await authService.login(
        email,
        password
      );
      if (loginResponse.success) {
        const userDetails: MyUserInterface = loginResponse.user_data;
        setUser(userDetails);
      } else {
        setError(loginResponse.message);
      }
    } catch (error) {
      setError("An error occurred while logging in. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-teal-100 shadow-lg transition-all hover:shadow-xl dark:border-teal-900">
      <form onSubmit={loginUser}>
        <CardContent className="pt-6">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@health.org"
                autoComplete="email"
                disabled={isLoading}
                required
                className={` ${error ? "border-red-500 focus-visible:ring-red-500" : "border-indigo-100 focus-visible:ring-indigo-500 dark:border-indigo-900"}`}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-teal-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                  className={` ${error ? "border-red-500 focus-visible:ring-red-500" : "border-indigo-100 focus-visible:ring-indigo-500 dark:border-indigo-900"}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-teal-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            <Button
              disabled={isLoading}
              className="w-full bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400 mt-4">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="mt-2 text-center text-sm">
            Need an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-teal-600 underline-offset-4 hover:underline dark:text-teal-500"
            >
              Request access
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
