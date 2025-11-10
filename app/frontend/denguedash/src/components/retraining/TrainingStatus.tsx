"use client";
import { Button } from "@/shadcn/components/ui/button";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Play, CheckCircle, Loader2 } from "lucide-react";

type TrainingStatusProps = {
  isTraining: boolean;
  isComplete: boolean;
  startTraining: () => void;
};

export function TrainingStatus(props: TrainingStatusProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {props.isTraining ? (
          <>
            <div className="mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-medium mb-2">Training in Progress</h3>
            <p className="text-muted-foreground max-w-md">
              Your model is being trained on the backend. This process may take
              several minutes depending on your configuration and dataset size.
            </p>
          </>
        ) : props.isComplete ? (
          <>
            <div className="mb-4 text-green-500">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-medium mb-2">Training Complete</h3>
            <p className="text-muted-foreground max-w-md">
              Your model has been successfully trained. View the results tab to
              see performance metrics and download the model.
            </p>
            <Button className="mt-6" onClick={() => props.startTraining()}>
              <Play className="h-4 w-4 mr-2" />
              Train Again
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-xl font-medium mb-2">Ready to Train</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Start the training process when you&apos;re ready. The model will
              be trained with the configuration parameters you&apos;ve set.
            </p>
            <Button onClick={props.startTraining} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Training
            </Button>
          </>
        )}
      </div>

      {props.isTraining && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              The training process is handled entirely by the backend. You can
              safely navigate to other parts of the application while training
              is in progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
