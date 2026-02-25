"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Table, Td, Th } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDevSession } from "@/hooks/use-dev-session";

type Asset = {
  id: string;
  title: string;
  status: "ACTIVE" | "INACTIVE";
  seller: { email: string };
};

export default function AdminPage() {
  const { devBypass, role } = useDevSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setAssets(await apiGet<Asset[]>("/admin/assets"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  useEffect(() => {
    if (devBypass && role !== "ADMIN") return;
    void load();
  }, [devBypass, role]);

  if (devBypass && role !== "ADMIN") {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Cette page est réservée au rôle ADMIN.
        </p>
      </section>
    );
  }

  async function toggle(asset: Asset) {
    await apiPost(`/admin/assets/${asset.id}/status`, {
      status: asset.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    }, "PATCH");
    await load();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Table>
        <thead>
          <tr>
            <Th>Titre</Th>
            <Th>Seller</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <Td>{asset.title}</Td>
              <Td>{asset.seller.email}</Td>
              <Td>{asset.status}</Td>
              <Td>
                <Button variant="outline" onClick={() => void toggle(asset)}>
                  Toggle
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
