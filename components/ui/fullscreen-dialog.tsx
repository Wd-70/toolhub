"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const FullscreenDialog = DialogPrimitive.Root;

const FullscreenDialogTrigger = DialogPrimitive.Trigger;

const FullscreenDialogPortal = DialogPrimitive.Portal;

const FullscreenDialogClose = DialogPrimitive.Close;

const FullscreenDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
FullscreenDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const FullscreenDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <FullscreenDialogPortal>
    <FullscreenDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center justify-center w-full h-full max-w-full max-h-full p-4">
        {children}
      </div>
    </DialogPrimitive.Content>
  </FullscreenDialogPortal>
));
FullscreenDialogContent.displayName = DialogPrimitive.Content.displayName;

export {
  FullscreenDialog,
  FullscreenDialogTrigger,
  FullscreenDialogContent,
  FullscreenDialogClose,
  FullscreenDialogOverlay,
};
