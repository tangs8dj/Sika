export interface ExportProgress {
  current: number;
  total: number;
  stage: 'rendering' | 'packing' | 'saving';
  message: string;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;
