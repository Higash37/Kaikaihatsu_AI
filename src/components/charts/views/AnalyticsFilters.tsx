import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export interface AnalyticsFiltersProps {
  filterOptions?: any;
  chartTypes?: any;
  ageRanges?: any;
  genderOptions?: any;
  locationOptions?: any;
  onFilterChange?: (filters: any) => void;
  onChartTypeChange?: (chartType: any) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ onFilterChange }) => {
  return (
    <Box>
      <FormControl>
        <InputLabel>Filter</InputLabel>
        <Select
          value=""
          onChange={(e) => onFilterChange?.(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};