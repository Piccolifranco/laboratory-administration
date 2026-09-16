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
  /**
   * Tailwind max-width class capping the panel, e.g. `md:max-w-5xl`.
   * Defaults to `md:max-w-2xl`, which suits a short form. The panel is always
   * `w-full` below that cap, so pass a max-width, not a width.
   */
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
      {/* z-50 puts the dialog above the sidebar, which sits at z-40 in AppShell.
          At the previous z-10 the sidebar painted over the modal: its left edge
          disappeared behind the nav and the overlay failed to dim it. */}
      <DialogHeadless className="relative z-50" onClose={removeQueryParams}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-overlay/75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-50 w-screen">
          <div className="flex h-full items-center justify-center text-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              {/* Always full width of the available space, capped by a max
                  width. Callers tune the cap via `width` rather than setting a
                  percentage of the viewport, so a six-field form does not
                  stretch across a 27" monitor. */}
              <DialogPanel
                className={`relative transform overflow-hidden rounded-lg bg-surface text-left transition-all flex w-full flex-col ${
                  width ?? "md:max-w-2xl"
                }`}
              >
                <div className="bg-surface flex-1 max-h-[90vh] overflow-y-auto px-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="mt-3 text-center w-full">
                    <DialogTitle
                      as="h3"
                      className="text-2xl font-semibold leading-6 text-fg"
                    >
                      {dialogTitle}
                    </DialogTitle>
                    <div className="w-full flex-1">
                      {dialogBody}
                    </div>
                  </div>
                </div>

                <div>{dialogFooter}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </DialogHeadless>
    </Transition>
  );
}
