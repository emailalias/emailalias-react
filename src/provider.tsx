import React, { createContext, useContext, useMemo } from "react";

/**
 * `proxyBaseUrl` should point to YOUR backend, which forwards requests to
 * api.emailalias.io with the API key attached server-side. Never ship an
 * API key to the browser — anyone can read it from devtools.
 *
 * Example (Next.js Route Handler):
 *   app/api/ea/[...path]/route.ts  →  proxies to api.emailalias.io
 *   <EmailAliasProvider proxyBaseUrl="/api/ea"> ... </EmailAliasProvider>
 */
export interface EmailAliasContextValue {
  proxyBaseUrl: string;
  fetchImpl: typeof fetch;
}

const EmailAliasContext = createContext<EmailAliasContextValue | null>(null);

export interface EmailAliasProviderProps {
  proxyBaseUrl: string;
  fetchImpl?: typeof fetch;
  children: React.ReactNode;
}

export function EmailAliasProvider({
  proxyBaseUrl,
  fetchImpl,
  children,
}: EmailAliasProviderProps) {
  const value = useMemo<EmailAliasContextValue>(
    () => ({
      proxyBaseUrl: proxyBaseUrl.replace(/\/$/, ""),
      fetchImpl: fetchImpl ?? fetch,
    }),
    [proxyBaseUrl, fetchImpl]
  );
  return (
    <EmailAliasContext.Provider value={value}>
      {children}
    </EmailAliasContext.Provider>
  );
}

export function useEmailAliasContext(): EmailAliasContextValue {
  const ctx = useContext(EmailAliasContext);
  if (!ctx) {
    throw new Error(
      "useEmailAlias* hooks must be used inside <EmailAliasProvider>"
    );
  }
  return ctx;
}
