import React from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  IconButton,
  ButtonGroup,
  Button,
} from '@mui/material';
import { Close, FilterList } from '@mui/icons-material';
import { Bar, Pie, Scatter, Line, Radar } from 'react-chartjs-2';
import { ChartType, FilterOptions, ModalContent, FilterOption } from '../types/analytics';

interface AnalyticsModalProps {
  readonly open: boolean;
  readonly content: ModalContent | null;
  readonly filterOptions: FilterOptions;
  readonly ageRanges: readonly FilterOption<readonly [number, number]>[];
  readonly genderOptions: readonly FilterOption[];
  onClose: () => void;
  onFilterChange: (options: FilterOptions) => void;
}

/**
 * Modal component for displaying expanded chart views with filtering options
 */
export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  open,
  content,
  filterOptions,
  ageRanges,
  genderOptions,
  onClose,
  onFilterChange,
}) => {
  if (!content) return null;

  const renderChart = () => {
    switch (content.chartType) {
      case 'pie':
        return <Pie data={content.data} options={content.options} />;
      case 'line':
        return <Line data={content.data} options={content.options} />;
      case 'scatter':
        return <Scatter data={content.data} options={content.options} />;
      case 'radar':
        return <Radar data={content.data} options={content.options} />;
      case 'bar':
      default:
        return <Bar data={content.data} options={content.options} />;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{
        backdrop: Backdrop
      }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }
      }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95vw', sm: '90vw', md: '85vw' },
          height: { xs: '85vh', sm: '80vh', md: '75vh' },
          backgroundColor: 'white',
          boxShadow: 24,
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Modal Header */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white'
          }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {content.title}
              </Typography>
              {content.subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {content.subtitle}
                </Typography>
              )}
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Filter Controls */}
          <Box sx={{
            p: 2,
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList sx={{ fontSize: 20, color: '#667eea' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  クイックフィルター:
                </Typography>
              </Box>
              
              {/* Age Filter */}
              <ButtonGroup size="small" variant="outlined">
                {ageRanges.slice(0, 4).map((range) => {
                  const isActive = filterOptions.ageRange[0] === range.value[0] &&
                                 filterOptions.ageRange[1] === range.value[1];
                  return (
                    <Button
                      key={range.label}
                      onClick={() =>
                        onFilterChange({
                          ...filterOptions,
                          ageRange: range.value as [number, number],
                        })
                      }
                      variant={isActive ? "contained" : "outlined"}
                      sx={{
                        fontSize: '0.75rem',
                        px: 1.5,
                        backgroundColor: isActive ? '#667eea !important' : 'transparent',
                        borderColor: '#667eea !important',
                        color: isActive ? 'white !important' : '#667eea !important',
                        '&:hover': {
                          backgroundColor: isActive 
                            ? '#5a67d8 !important' 
                            : 'rgba(102, 126, 234, 0.1) !important',
                        },
                      }}
                    >
                      {range.label}
                    </Button>
                  );
                })}
              </ButtonGroup>

              {/* Gender Filter */}
              <ButtonGroup size="small" variant="outlined">
                {genderOptions.map((option) => {
                  const isActive = filterOptions.gender === option.value;
                  return (
                    <Button
                      key={option.value}
                      onClick={() =>
                        onFilterChange({
                          ...filterOptions,
                          gender: option.value,
                        })
                      }
                      variant={isActive ? "contained" : "outlined"}
                      sx={{
                        fontSize: '0.75rem',
                        px: 1.5,
                        backgroundColor: isActive ? '#667eea !important' : 'transparent',
                        borderColor: '#667eea !important',
                        color: isActive ? 'white !important' : '#667eea !important',
                        '&:hover': {
                          backgroundColor: isActive 
                            ? '#5a67d8 !important' 
                            : 'rgba(102, 126, 234, 0.1) !important',
                        },
                      }}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </Box>
          </Box>

          {/* Chart Content */}
          <Box sx={{
            flex: 1,
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0
          }}>
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {renderChart()}
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};