export { EmailAliasProvider } from "./provider";
export type {
  EmailAliasProviderProps,
  EmailAliasContextValue,
} from "./provider";
export {
  useAliases,
  useDestinations,
  useAvailableDomains,
  useCreateAlias,
  useUpdateAlias,
  useUpdateAliasDisplayName,
  useDeleteAlias,
  useAddDestination,
  useDeleteDestination,
  useSendEmail,
} from "./hooks";
export type {
  Alias,
  Destination,
  AvailableDomain,
  CreateAliasOptions,
  AsyncState,
} from "./types";
