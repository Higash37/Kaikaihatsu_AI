import AnimalGaugeSection from "@/components/result/AnimalGaugeSection";
import FilterSection from "@/components/result/FilterSection";
import ResultCard from "@/components/result/ResultCard";
import ResultDescription from "@/components/result/ResultDescription";
import ResultHeader from "@/components/result/ResultHeader";
import ScatterChart from "@/components/result/ScatterChart";
import {
  ResultCardProps,
  ResultDescriptionProps,
  ResultState,
  FilterSectionProps,
  ScatterChartProps,
} from "@/types";

// 結果表示機能で使用するコンポーネントをエクスポート
export {
  AnimalGaugeSection,
  FilterSection,
  ResultCard,
  ResultDescription,
  ResultHeader,
  ScatterChart,
};

// 型定義のre-exportで共通型を利用
export type {
  ResultState,
  FilterSectionProps,
  ScatterChartProps,
  ResultCardProps,
  ResultDescriptionProps,
};
