import { TrainingConfig } from "@/interfaces/forecasting/training.interface";
import { Button } from "@/shadcn/components/ui/button";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Label } from "@/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select";
import { Slider } from "@/shadcn/components/ui/slider";
import { Database, RotateCcw } from "lucide-react";

type TrainingConfigFormProps = {
  config: TrainingConfig;
  setConfig: (config: TrainingConfig) => void;
};

export default function TrainingConfigForm(props: TrainingConfigFormProps) {
  const handleChange = (key: string, value: number) => {
    props.setConfig({ ...props.config, [key]: value });
  };

  const resetConfig = () => {
    props.setConfig({
      epochs: 100,
      batch_size: 1,
      learning_rate: 0.001,
      window_size: 10,
      validation_split: 0.2,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span>Using data from connected database</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="epochs">Epochs: {props.config.epochs}</Label>
              <span className="text-sm text-muted-foreground">(1-200)</span>
            </div>
            <Slider
              id="epochs"
              min={1}
              max={200}
              step={1}
              value={[props.config.epochs]}
              onValueChange={(value) => handleChange("epochs", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="validation_split">
                Validation Split: {props.config.validation_split}
              </Label>
              <span className="text-sm text-muted-foreground">(0.05-0.5)</span>
            </div>
            <Slider
              id="validation_split"
              min={0.05}
              max={0.5}
              step={0.05}
              value={[props.config.validation_split]}
              onValueChange={(value) =>
                handleChange("validation_split", value[0])
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="batch-size">
                Batch Size: {props.config.batch_size}
              </Label>
              <span className="text-sm text-muted-foreground">(8-128)</span>
            </div>
            <Select
              value={props.config.batch_size.toString()}
              onValueChange={(value) =>
                handleChange("batch_size", Number.parseInt(value))
              }
            >
              <SelectTrigger id="batch-size" className="w-full">
                <SelectValue placeholder="Select batch size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="32">32</SelectItem>
                <SelectItem value="64">64</SelectItem>
                <SelectItem value="128">128</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="learning-rate">
                Learning Rate: {props.config.learning_rate}
              </Label>
              <span className="text-sm text-muted-foreground">
                (0.0001-0.01)
              </span>
            </div>
            <Select
              value={props.config.learning_rate.toString()}
              onValueChange={(value) =>
                handleChange("learning_rate", Number.parseFloat(value))
              }
            >
              <SelectTrigger id="learning-rate" className="w-full">
                <SelectValue placeholder="Select learning rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.0001">0.0001</SelectItem>
                <SelectItem value="0.0005">0.0005</SelectItem>
                <SelectItem value="0.001">0.001</SelectItem>
                <SelectItem value="0.005">0.005</SelectItem>
                <SelectItem value="0.01">0.01</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="window-size">
                Window Size: {props.config.window_size}
              </Label>
              <span className="text-sm text-muted-foreground">(5-20)</span>
            </div>
            <Select
              value={props.config.window_size.toString()}
              onValueChange={(value) =>
                handleChange("window_size", Number.parseFloat(value))
              }
            >
              <SelectTrigger id="window-size" className="w-full">
                <SelectValue placeholder="Select window size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={resetConfig}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
