export interface Alias {
  id: string;
  alias_code: string;
  alias_email: string;
  destination_email: string;
  active: boolean;
  label: string | null;
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
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
