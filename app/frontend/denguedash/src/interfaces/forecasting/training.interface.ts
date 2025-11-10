export interface TrainingConfig {
  epochs: number;
  batch_size: number;
  learning_rate: number;
  window_size: number;
  validation_split: number;
}

export interface TrainingResponse {
  training_completed: boolean;
  metrics: TrainingMetrics;
  previous_model_metrics: TrainingMetrics | null;
  dataset_size: number;
  epochs_completed: number;
  model_committed: boolean;
  commit_reason: string;
  backup_info: TrainingBackupInfo;
}

interface TrainingMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

interface TrainingBackupInfo {
  model_backed_up: boolean;
  backup_model_path: string;
  backup_metadata_path: string;
}
