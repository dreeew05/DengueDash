import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shadcn/components/ui/popover";
import { Button } from "@/shadcn/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shadcn/components/ui/command";
import { cn } from "@/shadcn/lib/utils";

interface CustomPopoverOptionsProps {
  value: string;
  label: string;
}

interface CustomPopoverProps {
  label: string;
  options: CustomPopoverOptionsProps[];
  value: string;
  setValue: (value: string) => void;
}

export default function CustomPopover({
  label,
  options,
  value,
  setValue,
}: CustomPopoverProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="col-span-3 justify-between"
        >
          {options.find((option) => option.value === value)?.label ||
            `Select ${label}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="col-span-3 p-0">
        <Command>
          <CommandInput placeholder={`Select ${label}`} className="h-9" />
          <CommandList>
            <CommandEmpty>{`No ${label} found`}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
