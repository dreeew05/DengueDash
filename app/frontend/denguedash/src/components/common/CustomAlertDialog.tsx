"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "@shadcn/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@shadcn/components/ui/alert-dialog";

interface CustomAlertDialogProps {
  title: string;
  description: string;
  actionLabel: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "primary";
  children: React.ReactNode;
  onAction: () => void;
}

export function CustomAlertDialog({
  title,
  description,
  actionLabel,
  variant = "default",
  children,
  onAction,
}: CustomAlertDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = () => {
    onAction();
    setIsOpen(false);
  };

  const getButtonClasses = () => {
    switch (variant) {
      case "destructive":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "outline":
        return "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
      case "secondary":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
      case "ghost":
        return "hover:bg-accent hover:text-accent-foreground";
      case "link":
        return "text-primary underline-offset-4 hover:underline";
      case "primary":
        return "bg-primary text-primary-foreground hover:bg-primary/90";
      default:
        return ""; // Default button styling
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(getButtonClasses())}
            onClick={handleAction}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
