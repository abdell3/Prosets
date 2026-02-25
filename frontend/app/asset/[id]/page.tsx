"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiGet, apiPost, formatPrice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Asset = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category: { name: string };
  medias: { id: string; type: "IMAGE" | "VIDEO"; url: string }[];
};

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const { id } = await params;
    try {
      const [assetData, accessData] = await Promise.all([
        apiGet<Asset>(`/assets/${id}`),
        apiGet<{ hasAccess: boolean }>(`/assets/${id}/has-access`).catch(() => ({ hasAccess: false })),
      ]);
      setAsset(assetData);
      setHasAccess(accessData.hasAccess);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function buy() {
    if (!asset) return;
    const res = await apiPost<{ checkoutUrl: string }>("/checkout/create-session", {
      assetId: asset.id,
    });
    if (res.checkoutUrl) window.location.href = res.checkoutUrl;
  }

  async function download() {
    if (!asset) return;
    const res = await apiPost<{ downloadUrl: string }>(`/assets/${asset.id}/download`);
    window.open(res.downloadUrl, "_blank");
  }

  if (!asset) {
    return <p className="text-sm text-zinc-600">{message || "Chargement..."}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          {asset.medias.map((media) => (
            <div key={media.id} className="relative h-64 overflow-hidden rounded-md border bg-zinc-100">
              {media.type === "VIDEO" ? (
                <video src={media.url} controls className="h-full w-full object-cover" />
              ) : (
                <Image src={media.url} alt={asset.title} fill className="object-cover" />
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Badge>{asset.category.name}</Badge>
          <h1 className="text-2xl font-semibold">{asset.title}</h1>
          <p className="text-sm text-zinc-600">{asset.description}</p>
          <p className="text-xl font-bold">{formatPrice(asset.priceCents, asset.currency)}</p>
          {hasAccess ? (
            <Button onClick={() => void download()}>Download</Button>
          ) : (
            <Button onClick={() => void buy()}>Buy</Button>
          )}
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
