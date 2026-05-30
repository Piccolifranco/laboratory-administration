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
        "inline-flex items-center rounded-full px-2 py-1 text-xs text-fg-inverse",
        {
          "bg-danger ": status === "pending",
          "bg-success ": status === "paid",
        }
      )}
    >
      {status === "pending" ? (
        <>
          {`$${amount}` ?? "Pending"}
          <ClockIcon className="ml-1 w-4 text-fg-inverse" />
        </>
      ) : null}
      {status === "paid" ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-fg-inverse" />
        </>
      ) : null}
    </span>
  );
}
