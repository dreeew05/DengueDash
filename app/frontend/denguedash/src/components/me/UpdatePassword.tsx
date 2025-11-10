"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@shadcn/components/ui/button";
import { Input } from "@shadcn/components/ui/input";
import { Label } from "@shadcn/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@shadcn/components/ui/alert";
import { BaseServiceResponse } from "@/interfaces/services/services.interface";
import patchService from "@/services/patch.service";

export function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus("error");
      setMessage("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setStatus("error");
      setMessage("New password cannot be the same as the current password");
      return;
    }

    try {
      const response: BaseServiceResponse = await patchService.updatePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });

      if (response.success) {
        setStatus("success");
        setMessage("Password updated successfully");
      } else {
        setStatus("error");
        setMessage(response.message);
      }

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("error");
      setMessage("Failed to update password. Please try again.");
      console.error("Error updating password:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status !== "idle" && (
        <Alert
          variant={status === "error" ? "destructive" : "default"}
          className={
            status === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : ""
          }
        >
          {status === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Update Password
      </Button>
    </form>
  );
}
