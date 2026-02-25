import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

export function TabButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm",
        active ? "bg-black text-white" : "bg-white",
        className,
      )}
      {...props}
    />
  );
}
