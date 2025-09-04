import { ModelPredictions } from "@/interfaces/forecasting/predictions.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { Skeleton } from "@/shadcn/components/ui/skeleton";

type CasesCardsProps = {
  thisWeekCases: number;
  predictions: ModelPredictions;
};

export default function CasesCards(props: CasesCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Current Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold mb-2">{props.thisWeekCases}</div>
            <div className="text-sm text-muted-foreground">Reported Cases</div>
          </div>
        </CardContent>
      </Card>

      {props.predictions.length > 0 ? (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Next Week Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold mb-2">
                  {props.predictions[0].confidence_interval.lower} -
                  {props.predictions[0].confidence_interval.upper}
                </div>
                <div className="text-sm text-muted-foreground">
                  Predicted Cases
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Two Weeks Ahead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold mb-2">
                  {props.predictions[1].confidence_interval.lower} -
                  {props.predictions[1].confidence_interval.upper}
                </div>
                <div className="text-sm text-muted-foreground">
                  Predicted Cases
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">
                Next Week Prediction
              </CardTitle>
              <CardDescription>
                Generate predictions to see forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Skeleton className="h-16 w-16 rounded-full mb-2" />
                <Skeleton className="h-4 w-24 rounded-full mb-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">
                Two Weeks Ahead
              </CardTitle>
              <CardDescription>
                Generate predictions to see forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Skeleton className="h-16 w-16 rounded-full mb-2" />
                <Skeleton className="h-4 w-24 rounded-full mb-4" />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
