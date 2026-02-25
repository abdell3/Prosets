"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, formatPrice } from "@/lib/api";
import { Table, Td, Th } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDevSession } from "@/hooks/use-dev-session";

type Order = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELED";
  currency: string;
  items: Array<{
    id: string;
    asset: { id: string; title: string };
    priceCents: number;
  }>;
};

export default function DashboardPage() {
  const { devBypass, role } = useDevSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setOrders(await apiGet<Order[]>("/orders/my"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  useEffect(() => {
    if (devBypass && role !== "BUYER" && role !== "ADMIN") return;
    void load();
  }, [devBypass, role]);

  if (devBypass && role !== "BUYER" && role !== "ADMIN") {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Buyer Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Cette page est réservée au rôle BUYER.
        </p>
      </section>
    );
  }

  async function download(assetId: string) {
    const data = await apiPost<{ downloadUrl: string }>(`/assets/${assetId}/download`);
    window.open(data.downloadUrl, "_blank");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Buyer Dashboard</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Table>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Asset</Th>
            <Th>Prix</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {orders.flatMap((order) =>
            order.items.map((item) => (
              <tr key={item.id}>
                <Td>{order.id.slice(0, 8)}</Td>
                <Td>{item.asset.title}</Td>
                <Td>{formatPrice(item.priceCents, order.currency)}</Td>
                <Td>{order.status}</Td>
                <Td>
                  {order.status === "PAID" ? (
                    <Button variant="outline" onClick={() => void download(item.asset.id)}>
                      Download
                    </Button>
                  ) : (
                    "-"
                  )}
                </Td>
              </tr>
            )),
          )}
        </tbody>
      </Table>
    </section>
  );
}
