import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm", className)}
      {...props}
    >
      {children}
    </select>
  );
}
