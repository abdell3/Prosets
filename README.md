## Prosets MVP Marketplace

Marketplace MVP local pour assets numeriques (3D, snippets, templates) avec:
- Catalogue + recherche + filtre categorie
- Detail asset + preview image/video
- Auth hybride Auth0 + bypass DEV
- Paiement Stripe Checkout + webhook
- Upload seller via presigned PUT (preview public + source prive)
- Download buyer securise via presigned GET (5 min) si commande `PAID`
- Dashboards buyer/seller/admin

## Stack

- Frontend: Next.js App Router + Tailwind + composants style shadcn
- Backend: NestJS + Prisma + PostgreSQL
- Storage: MinIO (S3 compatible en local)
- Paiement: Stripe

## 1) Prerequis

- Node 20+
- Docker + Docker Compose
- Stripe CLI (optionnel mais recommande pour webhook live)

## 2) Lancer infra locale

Depuis la racine:

```bash
docker compose up -d
```

Services:
- Postgres: `localhost:5434`
- MinIO API: `localhost:9100`
- MinIO Console: `localhost:9101`

Buckets crees automatiquement:
- `public-previews` (public read)
- `private-sources` (private)

## 3) Variables d'environnement

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://prosets_user:prosets_password@localhost:5434/prosets?schema=public
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
S3_ENDPOINT=http://localhost:9100
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_PUBLIC_BUCKET=public-previews
S3_PRIVATE_BUCKET=private-sources
S3_PUBLIC_BASE_URL=http://localhost:9100/public-previews
AUTH0_ISSUER_BASE_URL=
AUTH0_AUDIENCE=
AUTH0_DOMAIN=
DEV_AUTH_BYPASS=true
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
AUTH0_SECRET=...
APP_BASE_URL=http://localhost:3000
AUTH0_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE=
NEXT_PUBLIC_DEV_AUTH_BYPASS=true
```

## 4) Installer deps + DB

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../backend && npx prisma generate && npx prisma migrate dev --name init_mvp && npm run prisma:seed
```

## 5) Lancer apps

Terminal 1:
```bash
cd backend && npm run start:dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

URLs:
- Front: `http://localhost:3000`
- API: `http://localhost:4000`

## Endpoints principaux

- `GET /health`
- `GET /me`
- `GET /assets?query=&categoryId=&page=&limit=`
- `GET /assets/:id`
- `GET /assets/categories`
- `POST /seller/assets`
- `PATCH /seller/assets/:id`
- `GET /seller/assets`
- `GET /seller/sales`
- `POST /storage/presign-upload`
- `POST /seller/assets/:id/attach-preview`
- `POST /seller/assets/:id/attach-source`
- `POST /checkout/create-session`
- `GET /orders/my`
- `POST /assets/:id/download`
- `GET /assets/:id/has-access`
- `POST /webhooks/stripe`
- `GET /admin/assets`
- `PATCH /admin/assets/:id/status`

## Demo rapide

### Seller flow
1. Aller sur `/seller`
2. En mode DEV, choisir role `SELLER` dans le switch top-bar
3. Creer un asset
4. Upload preview (public) puis source (private)

### Buyer flow
1. Aller sur `/catalogue`, role `BUYER`
2. Ouvrir un asset, cliquer `Buy`
3. Completer paiement Stripe test
4. Aller sur `/dashboard` puis `Download`

### Webhook Stripe en local

Option recommandee:

```bash
stripe listen --forward-to localhost:4000/webhooks/stripe
```

Puis copier le `whsec_...` affiche par Stripe CLI vers `backend/.env`.

Option demo rapide (sans Stripe CLI):
- Utiliser `POST /checkout/simulate-paid/:orderId` avec `DEV_AUTH_BYPASS=true`
- Puis tester `Download`
