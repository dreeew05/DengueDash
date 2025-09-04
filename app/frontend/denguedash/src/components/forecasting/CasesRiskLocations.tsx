import { ByLocationInterface } from "@/interfaces/stat/stat.interfaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import { MapPin } from "lucide-react";

type CasesRiskLocationsProps = {
  currentWeekDengueData: ByLocationInterface[];
};

export default function CasesRiskLocations(props: CasesRiskLocationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Risk Assessment</CardTitle>
        <CardDescription>Dengue risk by location</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {props.currentWeekDengueData.map((location) => (
              <div
                key={location.location}
                className="grid grid-cols-[1fr_auto] gap-4 py-2 border-b border-muted last:border-0"
              >
                <div className="flex items-start min-w-0">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
                  <span className="break-words">{location.location}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm whitespace-nowrap">
                    {location.case_count} cases
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
