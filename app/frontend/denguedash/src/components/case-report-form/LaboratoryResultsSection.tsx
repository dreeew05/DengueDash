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

interface LaboratoryResultsSectionProps {
  form: UseFormReturn<ReportFormValues>;
}

export function LaboratoryResultsSection({
  form,
}: LaboratoryResultsSectionProps) {
  const ns1Result = form.watch("ns1_result");
  const iggElisaResult = form.watch("igg_elisa");
  const igmElisaResult = form.watch("igm_elisa");
  const pcrResult = form.watch("pcr");
  const [isDateNs1Disabled, setDateNs1Disabled] = useState(false);
  const [isDateIggElisaDisabled, setDateIggElisaDisabled] = useState(false);
  const [isDateIgmElisaDisabled, setDateIgmElisaDisabled] = useState(false);
  const [isDatePcrDisabled, setDatePcrDisabled] = useState(false);

  useEffect(() => {
    setDateNs1Disabled(ns1Result === "PR" || !ns1Result);
    setDateIggElisaDisabled(iggElisaResult === "PR" || !iggElisaResult);
    setDateIgmElisaDisabled(igmElisaResult === "PR" || !igmElisaResult);
    setDatePcrDisabled(pcrResult === "PR" || !pcrResult);

    // Reset the date value to null if it should be disabled
    if (ns1Result === "PR") form.setValue("date_ns1", undefined);
    if (iggElisaResult === "PR") form.setValue("date_igg_elisa", undefined);
    if (igmElisaResult === "PR") form.setValue("date_igm_elisa", undefined);
    if (pcrResult === "PR") form.setValue("date_pcr", undefined);
  }, [ns1Result, iggElisaResult, igmElisaResult, pcrResult, form]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Laboratory Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="ns1_result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NS1</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"PR"}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pending Result" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PR">Pending Result</SelectItem>
                  <SelectItem value="P">Positive</SelectItem>
                  <SelectItem value="N">Negative</SelectItem>
                  <SelectItem value="E">Equivocal</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_ns1"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date done (NS1)</FormLabel>
              <Popover>
                <PopoverTrigger asChild disabled={isDateNs1Disabled}>
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

        <FormField
          control={form.control}
          name="igg_elisa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IgG ELISA</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"PR"}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pending Result" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PR">Pending Result</SelectItem>
                  <SelectItem value="P">Positive</SelectItem>
                  <SelectItem value="N">Negative</SelectItem>
                  <SelectItem value="E">Equivocal</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_igg_elisa"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date done (IgG ELISA)</FormLabel>
              <Popover>
                <PopoverTrigger asChild disabled={isDateIggElisaDisabled}>
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

        <FormField
          control={form.control}
          name="igm_elisa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IgM ELISA</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"PR"}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pending Result" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PR">Pending Result</SelectItem>
                  <SelectItem value="P">Positive</SelectItem>
                  <SelectItem value="N">Negative</SelectItem>
                  <SelectItem value="E">Equivocal</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_igm_elisa"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date done (IgM ELISA)</FormLabel>
              <Popover>
                <PopoverTrigger asChild disabled={isDateIgmElisaDisabled}>
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

        <FormField
          control={form.control}
          name="pcr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PCR</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"PR"}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pending Result" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PR">Pending Result</SelectItem>
                  <SelectItem value="P">Positive</SelectItem>
                  <SelectItem value="N">Negative</SelectItem>
                  <SelectItem value="E">Equivocal</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_pcr"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date done (PCR)</FormLabel>
              <Popover>
                <PopoverTrigger asChild disabled={isDatePcrDisabled}>
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
