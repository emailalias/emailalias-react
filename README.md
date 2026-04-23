# @emailalias/react

React hooks for the [EmailAlias.io](https://emailalias.io) API. Works in any React 17+ app (including Next.js).

API access is a **Premium** feature. Generate a key from **Settings → API Keys** in the web dashboard.

## ⚠️ Read this first — API keys must stay on your server

**Never put a `ea_live_...` key in the browser bundle.** Anyone can open devtools and copy it. EmailAlias.io keys are Premium-gated and can be used to run up email sends on your account.

This library deliberately does **not** accept an API key. Instead, you point it at a **proxy endpoint on your own backend** that attaches the key server-side. In Next.js, a Route Handler is perfect:

```ts
// app/api/ea/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}

const UPSTREAM = process.env.EMAILALIAS_BASE_URL ?? "https://api.emailalias.io";

async function proxy(req: NextRequest, path: string[]) {
  const url = `${UPSTREAM}/api/${path.join("/")}${req.nextUrl.search}`;
  const body = req.body ? await req.text() : undefined;
  const res = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${process.env.EMAILALIAS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body,
  });
  return new NextResponse(res.body, { status: res.status, headers: res.headers });
}
```

Then wrap your app and pass `proxyBaseUrl="/api/ea"`.

## Install

```bash
npm install @emailalias/react
```

## Quick start

```tsx
// app/layout.tsx (or wherever your root is)
import { EmailAliasProvider } from "@emailalias/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <EmailAliasProvider proxyBaseUrl="/api/ea">
          {children}
        </EmailAliasProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/aliases/page.tsx
"use client";
import { useAliases, useCreateAlias, useDeleteAlias } from "@emailalias/react";

export default function AliasesPage() {
  const { data: aliases, loading, error, refetch } = useAliases();
  const create = useCreateAlias();
  const del = useDeleteAlias();

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Failed: {error.message}</p>;

  return (
    <>
      <button
        onClick={async () => {
          await create.run({ alias_type: "random", label: "Shopping" });
          refetch();
        }}
        disabled={create.loading}
      >
        Create alias
      </button>

      <ul>
        {aliases?.map((a) => (
          <li key={a.id}>
            {a.alias_email} → {a.destination_email}
            <button
              onClick={async () => {
                await del.run(a.id);
                refetch();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

## Available hooks

### Queries (return `{ data, loading, error, refetch }`)

| Hook | Endpoint |
|---|---|
| `useAliases()` | `GET /api/aliases` |
| `useDestinations()` | `GET /api/destinations` |
| `useAvailableDomains()` | `GET /api/aliases/domains` |

### Mutations (return `{ run, loading, error }`)

| Hook | Endpoint |
|---|---|
| `useCreateAlias()` | `POST /api/aliases` |
| `useUpdateAlias()` | `PATCH /api/aliases/{id}` |
| `useDeleteAlias()` | `DELETE /api/aliases/{id}` |
| `useAddDestination()` | `POST /api/destinations` |
| `useDeleteDestination()` | `DELETE /api/destinations/{id}` |
| `useSendEmail()` | `POST /api/send-email` |

Full API reference: <https://emailalias.io/documentation>

## License

MIT
