"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, ReactNode } from "react";
import {
  Dialog as DialogHeadless,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

type DialogProps = {
  dialogTitle: string;
  dialogBody: ReactNode;
  dialogFooter: ReactNode;
  open: boolean;
};
export default function Dialog({
  dialogTitle,
  dialogBody,
  dialogFooter,
  open,
}: DialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const removeQueryParam = () => {
    const url = pathname + "?" + searchParams.toString();
    const newUrl = url.replace(/createPaciente=true/, "");
    console.log({ newUrl });
    router.replace(newUrl);
  };
  return (
    <Transition show={open}>
      <DialogHeadless className="relative z-10" onClose={removeQueryParam}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        {dialogTitle}
                      </DialogTitle>
                      <div className="mt-2">{dialogBody}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  {dialogFooter}
                  <button onClick={removeQueryParam}>CERRAR</button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </DialogHeadless>
    </Transition>
  );
}
