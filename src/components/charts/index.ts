/**
 * Analytics Charts Module
 * Refactored QuizAnalytics component with improved structure and security
 */

// Main component
export { default as QuizAnalytics } from './views/QuizAnalytics';

// Sub-components
export { ChartCard } from './views/ChartCard';
export { AnalyticsModal } from './views/AnalyticsModal';
export { AnalyticsFilters } from './views/AnalyticsFilters';

// Legacy components for compatibility
export { default as AdvancedAnalytics } from './views/AdvancedAnalytics';
export { default as AdvancedDashboard } from './views/AdvancedDashboard';

// Custom hooks
export { useAnalyticsData } from './hooks/useAnalyticsData';
export { useChartData } from './hooks/useChartData';

// Types
export type {
  ChartType,
  FilterOptions,
  DiagnosisCoordinate,
  StatisticsResult,
  AxisAnalysis,
  QuizResponse,
  Answer,
  Question,
  QuizData,
  DiagnosisResult,
  Axis,
  ModalContent,
  ChartDataset,
  ChartData,
  FilterOption,
  SanitizedData,
  AnalyticsComputationResult,
  ReportConfig,
  ReportGenerationResult
} from './types/analytics';