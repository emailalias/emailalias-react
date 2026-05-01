export interface Alias {
  id: string;
  alias_code: string;
  alias_email: string;
  destination_email: string;
  active: boolean;
  label: string | null;
  display_name: string | null;
  display_name_pending: string | null;
  display_name_pending_since: string | null;
  created_at: string;
}

export interface Destination {
  id: string | null;
  email: string;
  verified: boolean;
  is_primary: boolean;
  created_at: string | null;
}

export interface AvailableDomain {
  domain: string;
  type: "system" | "custom";
  is_default: boolean;
}

export interface CreateAliasOptions {
  alias_type?: "random" | "custom" | "tagged";
  label?: string;
  domain?: string;
  destination_email?: string;
  custom_code?: string;
  tag?: string;
  /** Premium-only. Sender label on outbound mail ("Name <addr>"). Set on
   * creation activates immediately; subsequent edits go through the
   * dedicated /display-name endpoint with a 24h cooldown. */
  display_name?: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
