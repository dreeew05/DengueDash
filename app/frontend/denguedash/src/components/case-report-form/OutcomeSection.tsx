import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shadcn/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shadcn/components/ui/popover";
import { Button } from "@shadcn/components/ui/button";
import { Calendar } from "@shadcn/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@shadcn/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import { ReportFormValues } from "@/lib/schemas/case-report-form.schema";
import { useEffect, useState } from "react";

interface OutcomeSectionProps {
  form: UseFormReturn<ReportFormValues>;
}

export function OutcomeSection({ form }: OutcomeSectionProps) {
  const outcome = form.watch("outcome");
  const [isOutcomeDisabled, setIsOutcomeDisabled] = useState(false);

  useEffect(() => {
    // Set the date_death field to undefined if the outcome is "A" (Alive)
    setIsOutcomeDisabled(outcome === "A");
    if (outcome === "A") form.setValue("date_death", undefined);
  }, [outcome, form]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Outcome</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="case_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Classification</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="C">Confirmed</SelectItem>
                  <SelectItem value="P">Probable</SelectItem>
                  <SelectItem value="S">Suspect</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outcome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outcome</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">Alive</SelectItem>
                  <SelectItem value="D">Dead</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_death"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Death</FormLabel>
              <Popover>
                <PopoverTrigger asChild disabled={isOutcomeDisabled}>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
