import { RecordSource } from '../engine/matchingEngine';

export interface StagingRecord extends RecordSource {
  id: string;
  importedAt: string;
  sourceFile: string;
  validationIssues: ValidationIssue[];
  status: 'valid' | 'warning' | 'error';
  rowNumber: number;
}

export interface ValidationIssue {
  field: keyof RecordSource;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface ImportBatch {
  id: string;
  fileName: string;
  fileSize: string;
  importedAt: string;
  importedBy: string;
  rowCount: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  version: string;
}

export interface ComparisonLogItem {
  id: string;
  sourceA: RecordSource;
  sourceB: RecordSource;
  overallScore: number;
  matchType: string;
  categoryLabel: string;
  categoryColor: 'success' | 'warning' | 'info' | 'error';
  testedAt: string;
  operatorNote?: string;
}

// Haqiqiy ish muhiti uchun toza dastlabki ro'yxatlar (Hech qanday soxta / mock ma'lumotlarsiz)
export const MOCK_SOLIQ_RECORDS: RecordSource[] = [];
export const MOCK_GREENZONE_SUBSCRIBERS: RecordSource[] = [];
export const INITIAL_IMPORT_BATCHES: ImportBatch[] = [];
export const INITIAL_COMPARISON_LOGS: ComparisonLogItem[] = [];
