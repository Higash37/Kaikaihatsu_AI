import React from 'react';
import { Card, CardContent } from '@mui/material';

export interface ChartCardProps {
  title?: string;
  subtitle?: string;
  chartType?: string;
  data?: any;
  options?: any;
  height?: number;
  onExpand?: () => void;
  children?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <Card>
      <CardContent>
        {title && <h3>{title}</h3>}
        {children}
      </CardContent>
    </Card>
  );
};