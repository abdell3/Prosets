"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setDevAuth, isDevBypassEnabled, type DevRole } from "@/lib/dev-auth";

const devBypass = isDevBypassEnabled();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("buyer@prosets.dev");

  if (!devBypass) {
    return (
      <section className="space-y-3">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-zinc-600">Connexion via Auth0.</p>
        <a href="/auth/login" className="text-sm underline">
          Continuer avec Auth0
        </a>
      </section>
    );
  }

  function loginAs(role: DevRole) {
    const safeEmail = email.trim() || `${role.toLowerCase()}@prosets.dev`;
    setDevAuth(role, safeEmail);
    if (role === "SELLER") router.push("/seller");
    else if (role === "ADMIN") router.push("/admin");
    else router.push("/dashboard");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">DEV Login</h1>
      <p className="text-sm text-zinc-600">
        Choisir un role de session pour tester les permissions.
      </p>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <div className="flex gap-2">
        <Button onClick={() => loginAs("BUYER")}>Login as BUYER</Button>
        <Button onClick={() => loginAs("SELLER")}>Login as SELLER</Button>
        <Button onClick={() => loginAs("ADMIN")}>Login as ADMIN</Button>
      </div>
    </section>
  );
}
