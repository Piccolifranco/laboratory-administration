import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

type CustomPopoverProps = {
  trigger: ReactNode;
  panel: ReactNode;
};
export const CustomPopover = ({ trigger, panel }: CustomPopoverProps) => {
  return (
    <Popover>
      <>
        <PopoverButton className="flex items-center gap-2">
          {trigger}
        </PopoverButton>
        <PopoverPanel anchor="bottom" className="flex flex-col">
          {panel}
        </PopoverPanel>
      </>
    </Popover>
  );
};
