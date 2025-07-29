import { Box, Stepper, Step, StepLabel, Typography } from "@mui/material";
import React from "react";

interface ProgressGaugeProps {
  currentStep: number; // 0, 1, 2
  steps: string[];
}

const ProgressGauge: React.FC<ProgressGaugeProps> = ({ currentStep, steps }) => {
  return (
    <Box
      sx={{
        width: "100%",
        mb: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        sx={{
          "& .MuiStepConnector-root": {
            top: { xs: 10, sm: 22 },
          },
          "& .MuiStepConnector-line": {
            borderColor: "#e0e0e0",
            borderTopWidth: 2,
          },
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
            borderColor: "#667eea",
          },
          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
            borderColor: "#667eea",
          },
          "& .MuiStepLabel-root .Mui-completed": {
            color: "#667eea",
          },
          "& .MuiStepLabel-root .Mui-active": {
            color: "#667eea",
          },
          "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": {
            fill: "#ffffff",
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  fontWeight: currentStep === index ? 600 : 400,
                  color: currentStep === index ? "#667eea" : "#666",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* 現在のステップ表示 */}
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: "#667eea",
            fontWeight: 600,
          }}
        >
          ステップ {currentStep + 1} / {steps.length}: {steps[currentStep]}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProgressGauge;