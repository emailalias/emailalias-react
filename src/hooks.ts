import { useCallback, useEffect, useRef, useState } from "react";
import { useEmailAliasContext } from "./provider";
import type {
  Alias,
  AsyncState,
  CreateAliasOptions,
  Destination,
  AvailableDomain,
} from "./types";

async function request<T>(
  ctx: { proxyBaseUrl: string; fetchImpl: typeof fetch },
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await ctx.fetchImpl(`${ctx.proxyBaseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = { detail: await res.text() };
  }

  if (!res.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? (payload as { detail: unknown }).detail
        : JSON.stringify(payload);
    const message = typeof detail === "string" ? detail : JSON.stringify(detail);
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return payload as T;
}

function useAsyncResource<T>(path: string): AsyncState<T> {
  const ctx = useEmailAliasContext();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const version = useRef(0);

  const fetchData = useCallback(() => {
    const v = ++version.current;
    setLoading(true);
    setError(null);
    request<T>(ctx, "GET", path)
      .then((d) => {
        if (v !== version.current) return;
        setData(d);
      })
      .catch((e: Error) => {
        if (v !== version.current) return;
        setError(e);
      })
      .finally(() => {
        if (v !== version.current) return;
        setLoading(false);
      });
  }, [ctx, path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/** List the authenticated account's aliases. */
export function useAliases(): AsyncState<Alias[]> {
  return useAsyncResource<Alias[]>("/api/aliases");
}

/** List verified forwarding destinations (includes the primary account email). */
export function useDestinations(): AsyncState<Destination[]> {
  return useAsyncResource<Destination[]>("/api/destinations");
}

/** List domains available for alias creation. */
export function useAvailableDomains(): AsyncState<AvailableDomain[]> {
  return useAsyncResource<AvailableDomain[]>("/api/aliases/domains");
}

interface MutationResult<Args extends unknown[], T> {
  run: (...args: Args) => Promise<T>;
  loading: boolean;
  error: Error | null;
}

function useMutation<Args extends unknown[], T>(
  fn: (
    ctx: { proxyBaseUrl: string; fetchImpl: typeof fetch },
    ...args: Args
  ) => Promise<T>
): MutationResult<Args, T> {
  const ctx = useEmailAliasContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        return await fn(ctx, ...args);
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [ctx, fn]
  );

  return { run, loading, error };
}

export function useCreateAlias() {
  return useMutation(async (ctx, opts: CreateAliasOptions = {}) =>
    request<Alias>(ctx, "POST", "/api/aliases", {
      alias_type: opts.alias_type ?? "random",
      ...opts,
    })
  );
}

export function useUpdateAlias() {
  return useMutation(
    async (
      ctx,
      aliasId: string,
      patch: { active?: boolean; label?: string }
    ) => request<Alias>(ctx, "PATCH", `/api/aliases/${aliasId}`, patch)
  );
}

/**
 * Schedule a display-name change for an alias (Premium-only).
 *
 * Edits go through a 24-hour cooldown — the new value lands in
 * `display_name_pending` and promotes to `display_name` 24h after the
 * most recent edit. Capped at 3 edits per rolling 24h per alias. Pass
 * `null` (or empty string) to clear the name; clearing follows the same
 * cooldown.
 *
 * Brand-impersonation patterns (PayPal, Apple, banks, etc.) are
 * rejected with 400 after homoglyph/leetspeak normalisation.
 */
export function useUpdateAliasDisplayName() {
  return useMutation(
    async (ctx, aliasId: string, displayName: string | null) =>
      request<Alias>(ctx, "PATCH", `/api/aliases/${aliasId}/display-name`, {
        display_name: displayName,
      })
  );
}

export function useDeleteAlias() {
  return useMutation(async (ctx, aliasId: string) =>
    request<void>(ctx, "DELETE", `/api/aliases/${aliasId}`)
  );
}

export function useAddDestination() {
  return useMutation(async (ctx, email: string) =>
    request<Destination>(ctx, "POST", "/api/destinations", { email })
  );
}

export function useDeleteDestination() {
  return useMutation(async (ctx, destinationId: string) =>
    request<void>(ctx, "DELETE", `/api/destinations/${destinationId}`)
  );
}

export function useSendEmail() {
  return useMutation(
    async (
      ctx,
      params: {
        alias_id: string;
        to_email: string;
        subject: string;
        body: string;
        html_body?: string;
      }
    ) =>
      request<{ success: boolean; message_id?: string; message: string }>(
        ctx,
        "POST",
        "/api/send-email",
        params
      )
  );
}
