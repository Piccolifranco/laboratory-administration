import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useRemoveQueryParam = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const removeQueryParams = () => {
    const url = pathname + "?" + searchParams;
    const newUrl = url
      .replace(/createPaciente=true/, "")
      .replace(/createVisita=true/, "")
      .replace(/editPaciente=true/, "");

    router.replace(newUrl);
  };
  return { removeQueryParams };
};
