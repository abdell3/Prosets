"use client";

import { useEffect, useState } from "react";
import {
  getDevEmail,
  getDevRole,
  isDevBypassEnabled,
  subscribeDevAuth,
  type DevRole,
} from "@/lib/dev-auth";

export function useDevSession() {
  const [role, setRole] = useState<DevRole>("BUYER");
  const [email, setEmail] = useState("buyer@prosets.dev");
  const devBypass = isDevBypassEnabled();

  useEffect(() => {
    if (!devBypass) return;
    const sync = () => {
      setRole(getDevRole());
      setEmail(getDevEmail());
    };
    sync();
    return subscribeDevAuth(sync);
  }, [devBypass]);

  return { devBypass, role, email };
}
