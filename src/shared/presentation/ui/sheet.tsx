"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * Panel lateral de shadcn/ui ("sheet"). Es el mismo diálogo de Radix,
 * pero pegado a un borde de la pantalla. Lo usamos para el menú en móvil.
 */
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

interface SheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
  side?: "left" | "right";
  /** Título accesible del panel (Radix lo exige). */
  title: string;
  closeLabel: string;
}

function SheetContent({
  className,
  children,
  side = "right",
  title,
  closeLabel,
  ...props
}: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay data-slot="sheet-overlay" className="fixed inset-0 z-50 bg-black/50" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        // Sin descripción: se lo decimos a Radix para que no muestre una advertencia.
        aria-describedby={undefined}
        className={cn(
          "fixed inset-y-0 z-50 flex h-full w-4/5 max-w-xs flex-col gap-4 bg-background p-4 shadow-lg",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          className,
        )}
        {...props}
      >
        <SheetPrimitive.Title className="flex h-10 items-center font-semibold">{title}</SheetPrimitive.Title>
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          <XIcon className="size-5" aria-hidden="true" />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
