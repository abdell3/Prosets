"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDevRole,
  isDevBypassEnabled,
  subscribeDevAuth,
  type DevRole,
} from "@/lib/dev-auth";

const devBypass = isDevBypassEnabled();

export function RoleNav() {
  const [role, setRole] = useState<DevRole>("BUYER");

  useEffect(() => {
    if (!devBypass) return;
    setRole(getDevRole());
    const unsub = subscribeDevAuth(() => setRole(getDevRole()));
    return unsub;
  }, []);

  const canBuyer = !devBypass || role === "BUYER" || role === "ADMIN";
  const canSeller = !devBypass || role === "SELLER" || role === "ADMIN";
  const canAdmin = !devBypass || role === "ADMIN";

  return (
    <>
      <Link href="/catalogue" className="text-sm text-zinc-600 hover:text-zinc-900">
        Catalogue
      </Link>
      {canBuyer ? (
        <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
          Dashboard
        </Link>
      ) : null}
      {canSeller ? (
        <Link href="/seller" className="text-sm text-zinc-600 hover:text-zinc-900">
          Seller
        </Link>
      ) : null}
      {canAdmin ? (
        <Link href="/admin" className="text-sm text-zinc-600 hover:text-zinc-900">
          Admin
        </Link>
      ) : null}
    </>
  );
}
