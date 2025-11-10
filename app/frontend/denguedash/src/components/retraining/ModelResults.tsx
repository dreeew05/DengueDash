import { TrainingResponse } from "@/interfaces/forecasting/training.interface";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/components/ui/tabs";

type ModelResultsProps = {
  trainingResults: TrainingResponse;
};

export function ModelResults(props: ModelResultsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4 pt-4">
          {/* <div className="grid grid-cols-2 gap-4"> */}
          <div
            className={
              props.trainingResults.previous_model_metrics
                ? "grid grid-cols-2 gap-4"
                : "grid grid-cols-1 gap-4"
            }
          >
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Current Model Metrics</h4>
                  <div className="grid gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MSE:</span>
                      <span>
                        {props.trainingResults.metrics.mse.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">RMSE:</span>
                      <span>
                        {props.trainingResults.metrics.rmse.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MAE:</span>
                      <span>
                        {props.trainingResults.metrics.mae.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">R²:</span>
                      <span>{props.trainingResults.metrics.r2.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {props.trainingResults.previous_model_metrics && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Previous Model Metrics</h4>
                    <div className="grid gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">MSE:</span>
                        <span>
                          {props.trainingResults.previous_model_metrics.mse.toFixed(
                            3
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">RMSE:</span>
                        <span>
                          {props.trainingResults.previous_model_metrics.rmse.toFixed(
                            3
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">MAE:</span>
                        <span>
                          {props.trainingResults.previous_model_metrics.mae.toFixed(
                            3
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">R²:</span>
                        <span>
                          {props.trainingResults.previous_model_metrics.r2.toFixed(
                            3
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* todo: implement later */}
          {/* <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium">Performance Comparison</h4>
                <p className="text-sm text-muted-foreground">
                  Comparison with previous model version
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Accuracy</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-green-600">+2.3%</div>
                      <div className="text-sm text-muted-foreground">
                        (93.4% → 95.7%)
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Inference Time</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-green-600">-15ms</div>
                      <div className="text-sm text-muted-foreground">
                        (42ms → 27ms)
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Model Size</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-amber-600">+2.1MB</div>
                      <div className="text-sm text-muted-foreground">
                        (8.4MB → 10.5MB)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>

        <TabsContent value="charts" className="space-y-4 pt-4">
          {/* todo: implement 2 charts here */}
          {/* <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Loss Curve</h4>
                  <div className="aspect-[4/3] bg-muted rounded-md flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">
                      Loss visualization chart
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Accuracy Curve</h4>
                  <div className="aspect-[4/3] bg-muted rounded-md flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">
                      Accuracy visualization chart
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium">Actual vs Predicted</h4>
                <div className="aspect-[2/1] bg-muted rounded-md flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">
                    Actual vs Predicted Visualization
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
