"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, useRouter } from "next/navigation";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get("search")?.toString() || "";

    // Create a new URLSearchParams object
    const params = new URLSearchParams();

    if (searchTerm) {
      params.set("search", searchTerm);
    }

    // Update the URL with the search term
    replace(`?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex flex-1 flex-shrink-0"
    >
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        name="search"
        id="search"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        defaultValue={searchParams.get("search")?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </form>
  );
}
