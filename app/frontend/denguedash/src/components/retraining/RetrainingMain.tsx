import { Button } from "@/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { Brain, LineChart, Settings } from "lucide-react";
import { useState } from "react";
import { TrainingStatus } from "./TrainingStatus";
import { ModelResults } from "./ModelResults";
import TrainingConfigForm from "./TrainingConfigForm";
import {
  TrainingConfig,
  TrainingResponse,
} from "@/interfaces/forecasting/training.interface";
import postService from "@/services/post.service";

export default function RetrainingMain() {
  const [activeTab, setActiveTab] = useState("config");
  const [isTraining, setIsTraining] = useState(false);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);
  const [modelConfig, setModelConfig] = useState<TrainingConfig>({
    epochs: 100,
    batch_size: 1,
    learning_rate: 0.001,
    window_size: 10,
    validation_split: 0.2,
  });
  const [trainingResults, setTrainingResults] =
    useState<TrainingResponse | null>(null);

  const startTraining = async () => {
    setIsTraining(true);
    setIsTrainingComplete(false);

    try {
      const response: TrainingResponse =
        await postService.retrainModel(modelConfig);
      setIsTraining(false);
      if (response.training_completed) {
        setIsTrainingComplete(true);
        setTrainingResults(response);
      }
    } catch (_) {
      console.error("Error during training:", _);
      setIsTraining(false);
    }
  };

  return (
    <div className="container mx-auto py-5">
      <div className="flex flex-col gap-6">
        <Tabs
          defaultValue="config"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 w-full">
            <TabsTrigger
              value="config"
              className="flex items-center gap-2"
              disabled={isTraining}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2"
              disabled={!isTrainingComplete}
            >
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Model Configuration</CardTitle>
                <CardDescription>
                  Configure your LSTM model parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingConfigForm
                  config={modelConfig}
                  setConfig={setModelConfig}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Training Status</CardTitle>
                <CardDescription>
                  Monitor your model training status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingStatus
                  isTraining={isTraining}
                  isComplete={isTrainingComplete}
                  startTraining={startTraining}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Model Results</CardTitle>
                <CardDescription>
                  View the model&apos;s performance metrics and charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trainingResults && (
                  <ModelResults trainingResults={trainingResults} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const prevTab = {
                config: "config",
                training: "config",
                results: "training",
              }[activeTab];
              setActiveTab(prevTab || "config");
            }}
            disabled={activeTab === "config" || isTraining}
          >
            Previous
          </Button>

          {activeTab !== "results" && (
            <Button
              onClick={() => {
                const nextTab = {
                  config: "training",
                  training: isTrainingComplete ? "results" : "training",
                  results: "results",
                }[activeTab];

                setActiveTab(nextTab || "config");
              }}
              disabled={
                isTraining || (activeTab === "training" && !isTrainingComplete)
              }
            >
              {activeTab === "results" ? "Finish" : "Next"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
