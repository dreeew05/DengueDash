interface ConfidenceInterval {
  lower: number;
  upper: number;
}

interface PredictionData {
  confidence_interval: ConfidenceInterval;
  date: string;
  predicted_cases: number;
  week: number;
}

export type ModelPredictions = PredictionData[];

export interface PredictionMetadata {
  window_size: number;
  prediction_generated_at: string;
  last_trained: string;
}

export interface MetadataMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface ModelPredictionResponse {
  predictions: ModelPredictions;
  metadata: PredictionMetadata;
  success?: boolean;
  message?: string;
}
