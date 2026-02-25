"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiGet, formatPrice } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Category = { id: string; name: string };
type Asset = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  medias: { id: string; url: string }[];
  category: Category;
};

export default function CataloguePage() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const [categoriesData, assetsData] = await Promise.all([
        apiGet<Category[]>("/assets/categories"),
        apiGet<{ items: Asset[] }>(
          `/assets?query=${encodeURIComponent(query)}&categoryId=${encodeURIComponent(categoryId)}&page=1&limit=24`,
        ),
      ]);
      setCategories(categoriesData);
      setAssets(assetsData.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => assets, [assets]);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Catalogue</h1>
        <p className="text-sm text-zinc-600">Assets 3D, snippets et templates.</p>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <Input
          placeholder="Recherche..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map((cat) => (
            <option value={cat.id} key={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
        <button
          onClick={() => void load()}
          className="h-9 rounded-md border bg-white px-3 text-sm"
        >
          Rechercher
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((asset) => (
          <Card key={asset.id}>
            <CardHeader>
              <div className="relative mb-2 h-40 w-full overflow-hidden rounded-md bg-zinc-100">
                {asset.medias[0]?.url ? (
                  <Image
                    src={asset.medias[0].url}
                    alt={asset.title}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <CardTitle>{asset.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="line-clamp-2 text-sm text-zinc-600">{asset.description}</p>
              <div className="flex items-center justify-between">
                <Badge>{asset.category.name}</Badge>
                <span className="font-medium">{formatPrice(asset.priceCents, asset.currency)}</span>
              </div>
              <Link className="text-sm underline" href={`/asset/${asset.id}`}>
                Voir le détail
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
