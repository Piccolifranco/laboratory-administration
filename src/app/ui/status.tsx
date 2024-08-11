import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function InvoiceStatus({
  status,
  amount,
}: {
  status: string;
  amount: number;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs text-white",
        {
          "bg-red-500 ": status === "pending",
          "bg-green-500 ": status === "paid",
        }
      )}
    >
      {status === "pending" ? (
        <>
          {`$${amount}` ?? "Pending"}
          <ClockIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {status === "paid" ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
