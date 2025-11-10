// Todo: fix this shit

"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@shadcn/components/ui/dialog";
import { Button } from "@shadcn/components/ui/button";
import { Label } from "@shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/components/ui/select";
import { Separator } from "@shadcn/components/ui/separator";
import { Calendar } from "@shadcn/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shadcn/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FlaskConical, ClipboardList } from "lucide-react";
import { cn } from "@shadcn/lib/utils";
import patchService from "@/services/patch.service";
import {
  BaseErrorResponse,
  BaseServiceResponse,
} from "@/interfaces/services/services.interface";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import {
  CaseCanBeUpdatedFields,
  CaseClassificationDisplay,
  LaboratoryResultDisplay,
  OutcomeDisplay,
  CaseView,
} from "@/interfaces/dengue-reports/dengue-reports.interface";

type LaboratoryResult = "PR" | "P" | "N" | "E";
type Outcome = "A" | "D";

const labClassDisplayToCode: { [key: string]: LaboratoryResult } = {
  "Pending Result": "PR",
  Positive: "P",
  Negative: "N",
  Equivocal: "E",
};
const outcomeDisplayToCode: { [key: string]: Outcome } = {
  Alive: "A",
  Deceased: "D",
};

const getKeyByValue = <T extends string | number | symbol, V>(
  object: Record<T, V>,
  value: V
): T | undefined => {
  const entry = Object.entries(object).find(([, val]) => val === value);
  return entry ? (entry[0] as T) : undefined;
};

export type CaseUpdateForm = {
  ns1_result: LaboratoryResult;
  date_ns1: string | null;
  igg_elisa: LaboratoryResult;
  date_igg_elisa: string | null;
  igm_elisa: LaboratoryResult;
  date_igm_elisa: string | null;
  pcr: LaboratoryResult;
  date_pcr: string | null;
  outcome: Outcome;
  date_death: string | null;
};

type UpdateCaseDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedData: Partial<CaseView>) => void;
  caseId: number;
  caseClassification: CaseClassificationDisplay;
  canBeUpdateFields: CaseCanBeUpdatedFields;
};

export function UpdateCaseDialog(props: UpdateCaseDialogProps) {
  const [ns1Result, setNs1Result] = useState<LaboratoryResult>(
    labClassDisplayToCode[props.canBeUpdateFields.ns1_result_display]
  );
  const [ns1Date, setNs1Date] = useState<Date | undefined>(
    props.canBeUpdateFields.date_ns1
      ? new Date(props.canBeUpdateFields.date_ns1)
      : undefined
  );

  const [igGResult, setIgGResult] = useState<LaboratoryResult>(
    labClassDisplayToCode[props.canBeUpdateFields.igg_elisa_display]
  );
  const [igGDate, setIgGDate] = useState<Date | undefined>(
    props.canBeUpdateFields.date_igg_elisa
      ? new Date(props.canBeUpdateFields.date_igg_elisa)
      : undefined
  );

  const [igMResult, setIgMResult] = useState<LaboratoryResult>(
    labClassDisplayToCode[props.canBeUpdateFields.igm_elisa_display]
  );
  const [igMDate, setIgMDate] = useState<Date | undefined>(
    props.canBeUpdateFields.date_igm_elisa
      ? new Date(props.canBeUpdateFields.date_igm_elisa)
      : undefined
  );

  const [pcrResult, setPcrResult] = useState<LaboratoryResult>(
    labClassDisplayToCode[props.canBeUpdateFields.pcr_display]
  );
  const [pcrDate, setPcrDate] = useState<Date | undefined>(
    props.canBeUpdateFields.date_pcr
      ? new Date(props.canBeUpdateFields.date_pcr)
      : undefined
  );
  const [outcome, setOutcome] = useState<Outcome>(
    outcomeDisplayToCode[props.canBeUpdateFields.outcome_display]
  );
  const [dateOfDeath, setDateOfDeath] = useState<Date | undefined>(
    props.canBeUpdateFields.date_death
      ? new Date(props.canBeUpdateFields.date_death)
      : undefined
  );

  const getCaseClassification = (): CaseClassificationDisplay => {
    const hasPositiveResult =
      ns1Result === "P" ||
      igGResult === "P" ||
      igMResult === "P" ||
      pcrResult === "P";

    if (hasPositiveResult) {
      return "Confirmed";
    } else if (props.caseClassification == "Confirmed") {
      return "Probable";
    }
    return props.caseClassification;
  };

  useEffect(() => {
    if (ns1Result != "PR") {
      setNs1Date(new Date());
    }
    if (igGResult != "PR") {
      setIgGDate(new Date());
    }
    if (igMResult != "PR") {
      setIgMDate(new Date());
    }
    if (pcrResult != "PR") {
      setPcrDate(new Date());
    }
    if (outcome === "D") {
      setDateOfDeath(new Date());
    }
  }, [ns1Result, igGResult, igMResult, pcrResult, outcome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: CaseUpdateForm = {
      ns1_result: ns1Result,
      date_ns1:
        ns1Result !== "PR" && ns1Date ? format(ns1Date, "yyyy-MM-dd") : null,
      igg_elisa: igGResult,
      date_igg_elisa:
        igGResult !== "PR" && igGDate ? format(igGDate, "yyyy-MM-dd") : null,
      igm_elisa: igMResult,
      date_igm_elisa:
        igMResult !== "PR" && igMDate ? format(igMDate, "yyyy-MM-dd") : null,
      pcr: pcrResult,
      date_pcr:
        pcrResult !== "PR" && pcrDate ? format(pcrDate, "yyyy-MM-dd") : null,
      outcome: outcome,
      date_death:
        outcome === "D" && dateOfDeath
          ? format(dateOfDeath, "yyyy-MM-dd")
          : null,
    };
    try {
      const response: BaseServiceResponse | BaseErrorResponse =
        await patchService.updateCaseStatus(props.caseId, formData);
      if (response.success) {
        toast.success("Case updated successfully", {
          description: "The case has been updated successfully.",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
        // Make the changes reflect in the UI
        const updatedData: Partial<CaseView> = {
          ns1_result_display: getKeyByValue(
            labClassDisplayToCode,
            formData.ns1_result
          ) as LaboratoryResultDisplay,
          date_ns1: formData.date_ns1,
          igg_elisa_display: getKeyByValue(
            labClassDisplayToCode,
            formData.igg_elisa
          ) as LaboratoryResultDisplay,
          date_igg_elisa: formData.date_igg_elisa,
          igm_elisa_display: getKeyByValue(
            labClassDisplayToCode,
            formData.igm_elisa
          ) as LaboratoryResultDisplay,
          date_igm_elisa: formData.date_igm_elisa,
          pcr_display: getKeyByValue(
            labClassDisplayToCode,
            formData.pcr
          ) as LaboratoryResultDisplay,
          date_pcr: formData.date_pcr,
          case_class_display: getCaseClassification(),
          outcome_display: getKeyByValue(
            outcomeDisplayToCode,
            formData.outcome
          ) as OutcomeDisplay,
          date_death: formData.date_death,
        };
        props.onUpdate(updatedData);
      } else {
        if (typeof response.message === "string") {
          // Simple message (like general failure message)
          toast.warning("Failed to update case", {
            description: response.message,
            duration: defaultToastSettings.duration,
            dismissible: defaultToastSettings.isDismissible,
          });
        } else {
          Object.entries(response.message).forEach(([field, errors]) => {
            (errors as string[]).forEach((error: string) => {
              toast.error("Failed to update case", {
                description: `${field}: ${error}`,
                duration: defaultToastSettings.duration,
                dismissible: defaultToastSettings.isDismissible,
              });
            });
          });
        }
      }
    } catch (error) {
      toast.error("Failed to update case", {
        description: "An error occurred while updating the case.",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
      console.error("Error updating case:", error);
    } finally {
      props.onClose();
    }
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Update Case #{props.caseId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Laboratory Results Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <FlaskConical className="h-5 w-5" />
              <h3>Laboratory Results</h3>
            </div>
            <Separator />

            {/* NS1 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ns1-result">NS1</Label>
                <Select
                  value={ns1Result}
                  onValueChange={(value) =>
                    setNs1Result(value as LaboratoryResult)
                  }
                >
                  <SelectTrigger id="ns1-result" className="w-full">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PR">Pending Result</SelectItem>
                    <SelectItem value="P">Positive</SelectItem>
                    <SelectItem value="N">Negative</SelectItem>
                    <SelectItem value="E">Equivocal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Done</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !ns1Date && "text-muted-foreground"
                      )}
                      disabled={ns1Result === "PR"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {ns1Date && ns1Result != "PR"
                        ? format(ns1Date, "PPP")
                        : "N/A"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={ns1Date}
                      onSelect={setNs1Date}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* IgG Elisa */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="igg-result">IgG Elisa</Label>
                <Select
                  value={igGResult}
                  onValueChange={(value) =>
                    setIgGResult(value as LaboratoryResult)
                  }
                >
                  <SelectTrigger id="igg-result" className="w-full">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PR">Pending Result</SelectItem>
                    <SelectItem value="P">Positive</SelectItem>
                    <SelectItem value="N">Negative</SelectItem>
                    <SelectItem value="E">Equivocal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Done</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !igGDate && "text-muted-foreground"
                      )}
                      disabled={igGResult === "PR"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {igGDate && igGResult != "PR"
                        ? format(igGDate, "PPP")
                        : "N/A"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={igGDate}
                      onSelect={setIgGDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* IgM Elisa */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="igm-result">IgM Elisa</Label>
                <Select
                  value={igMResult}
                  onValueChange={(value) =>
                    setIgMResult(value as LaboratoryResult)
                  }
                >
                  <SelectTrigger id="igm-result" className="w-full">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PR">Pending Result</SelectItem>
                    <SelectItem value="P">Positive</SelectItem>
                    <SelectItem value="N">Negative</SelectItem>
                    <SelectItem value="E">Equivocal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Done</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !igMDate && "text-muted-foreground"
                      )}
                      disabled={igMResult === "PR"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {igMDate && igMResult != "PR"
                        ? format(igMDate, "PPP")
                        : "N/A"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={igMDate}
                      onSelect={setIgMDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* PCR */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pcr-result">PCR</Label>
                <Select
                  value={pcrResult}
                  onValueChange={(value) =>
                    setPcrResult(value as LaboratoryResult)
                  }
                >
                  <SelectTrigger id="pcr-result" className="w-full">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PR">Pending Result</SelectItem>
                    <SelectItem value="P">Positive</SelectItem>
                    <SelectItem value="N">Negative</SelectItem>
                    <SelectItem value="E">Equivocal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Done</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !pcrDate && "text-muted-foreground"
                      )}
                      disabled={pcrResult === "PR"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pcrDate && pcrResult != "PR"
                        ? format(pcrDate, "PPP")
                        : "N/A"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pcrDate}
                      onSelect={setPcrDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Outcome Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <ClipboardList className="h-5 w-5" />
                <h3>Outcome</h3>
              </div>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outcome">Outcome</Label>
                  <Select
                    value={outcome}
                    onValueChange={(value) => setOutcome(value as Outcome)}
                  >
                    <SelectTrigger id="outcome" className="w-full">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Alive</SelectItem>
                      <SelectItem value="D">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {outcome === "D" && (
                  <div className="space-y-2">
                    <Label>Date of Death</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateOfDeath && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateOfDeath
                            ? format(dateOfDeath, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateOfDeath}
                          onSelect={setDateOfDeath}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={props.onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
