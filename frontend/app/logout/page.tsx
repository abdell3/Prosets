"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearDevAuth, isDevBypassEnabled } from "@/lib/dev-auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    if (isDevBypassEnabled()) {
      clearDevAuth();
      router.replace("/catalogue");
      return;
    }
    window.location.href = "/auth/logout";
  }, [router]);

  return <p className="text-sm text-zinc-600">Déconnexion...</p>;
}
