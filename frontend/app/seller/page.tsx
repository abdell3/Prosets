"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, formatPrice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { useDevSession } from "@/hooks/use-dev-session";

type Category = { id: string; name: string };
type Asset = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE";
  categoryId: string;
};

export default function SellerPage() {
  const { devBypass, role } = useDevSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceCents: 1000,
    categoryId: "",
  });

  async function load() {
    try {
      const [cats, sellerAssets, sales] = await Promise.all([
        apiGet<Category[]>("/assets/categories"),
        apiGet<Asset[]>("/seller/assets"),
        apiGet<{ totalCents: number }>("/seller/sales"),
      ]);
      setCategories(cats);
      setAssets(sellerAssets);
      setSalesTotal(sales.totalCents);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  useEffect(() => {
    if (devBypass && role !== "SELLER" && role !== "ADMIN") return;
    void load();
  }, [devBypass, role]);

  if (devBypass && role !== "SELLER" && role !== "ADMIN") {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Cette page est réservée au rôle SELLER.
        </p>
      </section>
    );
  }

  async function createAsset() {
    await apiPost("/seller/assets", { ...form, status: "INACTIVE" });
    setForm({ title: "", description: "", priceCents: 1000, categoryId: "" });
    await load();
  }

  async function uploadFile(assetId: string, kind: "PREVIEW" | "SOURCE", file: File) {
    const presign = await apiPost<{ uploadUrl: string; publicUrl?: string; key: string }>(
      "/storage/presign-upload",
      {
        kind,
        assetId,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      },
    );
    await fetch(presign.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });

    if (kind === "PREVIEW") {
      await apiPost(`/seller/assets/${assetId}/attach-preview`, { url: presign.publicUrl });
    } else {
      await apiPost(`/seller/assets/${assetId}/attach-source`, {
        key: presign.key,
        originalName: file.name,
        sizeBytes: file.size,
      });
    }
    await load();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Créer un asset</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Price cents"
            value={form.priceCents}
            onChange={(e) => setForm((prev) => ({ ...prev, priceCents: Number(e.target.value) }))}
          />
          <Select
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          <Button onClick={() => void createAsset()}>Create asset</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes assets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Titre</Th>
                <Th>Prix</Th>
                <Th>Status</Th>
                <Th>Upload Preview</Th>
                <Th>Upload Source</Th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <Td>{asset.title}</Td>
                  <Td>{formatPrice(asset.priceCents, asset.currency)}</Td>
                  <Td>{asset.status}</Td>
                  <Td>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadFile(asset.id, "PREVIEW", file);
                      }}
                    />
                  </Td>
                  <Td>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadFile(asset.id, "SOURCE", file);
                      }}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{formatPrice(salesTotal, "usd")}</p>
        </CardContent>
      </Card>
    </section>
  );
}
