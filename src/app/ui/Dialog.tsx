"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, ReactNode, CSSProperties } from "react";
import {
  Dialog as DialogHeadless,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useRemoveQueryParam } from "../utils/removeQueryParams";

type DialogProps = {
  dialogTitle: string;
  dialogBody: ReactNode;
  dialogFooter: ReactNode;
  open: boolean;
  width?: string;
};
export default function Dialog({
  dialogTitle,
  dialogBody,
  dialogFooter,
  open,
  width,
}: DialogProps) {
  const { removeQueryParams } = useRemoveQueryParam();

  return (
    <Transition show={open}>
      <DialogHeadless className="relative z-10" onClose={removeQueryParams}>
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

        <div className="fixed inset-0 z-10 w-screen ">
          <div className="flex h-full items-end justify-center  text-center sm:items-center p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={`relative transform overflow-hidden rounded-lg min-h-[95vh] bg-white text-left transition-all flex w-[100%] ${
                  width ? width : "md:w-[90%]"
                } flex-col`}
              >
                <div className="bg-white flex-1 max-h-[100vh] md:max-h-[100vh] px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="mt-3 text-center w-full">
                    <DialogTitle
                      as="h3"
                      className="text-2xl font-semibold leading-6 text-gray-900"
                    >
                      {dialogTitle}
                    </DialogTitle>
                    <div className="w-full flex-1 max-h-[75vh]">
                      {dialogBody}
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </DialogHeadless>
    </Transition>
  );
}
