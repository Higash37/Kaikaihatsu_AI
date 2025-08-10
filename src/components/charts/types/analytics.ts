/**
 * Type definitions for analytics components
 * Provides improved type safety and better code documentation
 */

export type ChartType = 'bar' | 'pie' | 'line' | 'scatter' | 'radar' | 'stats';

export interface FilterOptions {
  readonly ageRange: readonly [number, number];
  readonly gender: string;
  readonly location: string;
  readonly responseDate: string;
}

export interface DiagnosisCoordinate {
  readonly x: number;
  readonly y: number;
  readonly resultName: string;
  count: number; // Mutable because we increment it during processing
}

export interface StatisticsResult {
  readonly mean: number;
  readonly std: number;
  readonly median: number;
  readonly variance: number;
}

export interface AxisAnalysis {
  readonly axis: {
    readonly name: string;
    readonly key: string;
  };
  readonly scores: readonly number[];
  readonly statistics: StatisticsResult;
  readonly distribution: Record<number, number>;
}

export interface QuizResponse {
  readonly id: string;
  readonly answers: readonly Answer[];
  readonly demographics?: {
    readonly age?: number;
    readonly gender?: string;
  };
  readonly location?: string;
  readonly createdAt?: string;
  readonly timestamp?: string;
}

export interface Answer {
  readonly questionId: string;
  readonly value: number;
}

export interface Question {
  readonly id: string;
  readonly text: string;
  readonly axisWeights?: {
    readonly x?: number;
    readonly y?: number;
    readonly [key: string]: number | undefined;
  };
}

export interface QuizData {
  readonly questions?: {
    readonly questions: readonly Question[];
    readonly results: readonly DiagnosisResult[];
    readonly axes: readonly Axis[];
  };
}

export interface DiagnosisResult {
  readonly name: string;
  readonly x: number;
  readonly y: number;
}

export interface Axis {
  readonly name: string;
  readonly key: string;
}

export interface ModalContent {
  readonly title: string;
  readonly subtitle?: string;
  readonly chartType: ChartType;
  readonly data: any; // Chart.js data structure - kept as any for compatibility
  readonly options: any; // Chart.js options structure - kept as any for compatibility
  readonly questionId?: string;
}

export interface ChartDataset {
  readonly label: string;
  readonly data: readonly number[];
  readonly backgroundColor: readonly string[];
  readonly borderColor: readonly string[];
  readonly borderWidth: number;
}

export interface ChartData {
  readonly labels: readonly string[];
  readonly datasets: readonly ChartDataset[];
}

export interface FilterOption<T = string> {
  readonly label: string;
  readonly value: T;
}

// Security-related types for data sanitization
export interface SanitizedData {
  readonly isClean: boolean;
  readonly originalValue: any;
  readonly sanitizedValue: any;
  readonly warnings?: readonly string[];
}

// Analytics computation result types
export interface AnalyticsComputationResult {
  readonly success: boolean;
  readonly data?: any;
  readonly error?: string;
  readonly computationTime: number;
}

// Report generation types
export interface ReportConfig {
  readonly includeCharts: boolean;
  readonly includeStatistics: boolean;
  readonly format: 'pdf' | 'excel' | 'json';
  readonly filters: FilterOptions;
}

export interface ReportGenerationResult {
  readonly success: boolean;
  readonly downloadUrl?: string;
  readonly error?: string;
  readonly generatedAt: Date;
}