import Constants from "expo-constants";
import type { CommerceProvider } from "@/types/commerce";
import { MockProvider } from "./mock";
import { ToastReadOnlyProvider } from "./toast";

type Extra = { commerceProvider?: "mock" | "toast" };
const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const commerceProvider: CommerceProvider =
  extra.commerceProvider === "toast" ? ToastReadOnlyProvider : MockProvider;
