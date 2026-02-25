"use client";

import { useEffect, useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getDevEmail,
  getDevRole,
  isDevBypassEnabled,
  setDevAuth,
} from "@/lib/dev-auth";

const enabled = isDevBypassEnabled();

export function DevRoleSwitch() {
  const [role, setRole] = useState("BUYER");
  const [email, setEmail] = useState("buyer@prosets.dev");

  useEffect(() => {
    if (!enabled) return;
    setRole(getDevRole());
    setEmail(getDevEmail());
  }, []);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-zinc-50 px-2 py-1">
      <span className="text-xs text-zinc-600">DEV</span>
      <Select
        value={role}
        onChange={(e) => {
          const nextRole = e.target.value;
          setRole(nextRole);
          const fallbackEmail = `${nextRole.toLowerCase()}@prosets.dev`;
          if (!email) {
            setEmail(fallbackEmail);
            setDevAuth(nextRole as "BUYER" | "SELLER" | "ADMIN", fallbackEmail);
            return;
          }
          setDevAuth(nextRole as "BUYER" | "SELLER" | "ADMIN", email);
        }}
      >
        <option value="BUYER">BUYER</option>
        <option value="SELLER">SELLER</option>
        <option value="ADMIN">ADMIN</option>
      </Select>
      <Input
        className="h-8 w-44"
        value={email}
        onChange={(e) => {
          const nextEmail = e.target.value;
          setEmail(nextEmail);
          setDevAuth(role as "BUYER" | "SELLER" | "ADMIN", nextEmail);
        }}
        placeholder="email"
      />
      <Button
        variant="outline"
        className="h-8 px-2 text-xs"
        onClick={() => setDevAuth(role as "BUYER" | "SELLER" | "ADMIN", email)}
      >
        Apply
      </Button>
    </div>
  );
}
