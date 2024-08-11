import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types/supabase";

const createFetch =
  (options: Pick<RequestInit, "next" | "cache">) =>
  (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options,
    });
  };
export const supabase = createClient<Database>(
  "https://lylnvhhzhyqlbbjgymws.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? "",
  {
    global: {
      fetch: createFetch({
        cache: "no-store",
      }),
    },
  }
);
