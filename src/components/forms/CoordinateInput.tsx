import { Box, TextField, Typography, Paper } from "@mui/material";
import React from "react";

interface AxisData {
  yTop: string;    // Y軸上部
  yBottom: string; // Y軸下部
  xRight: string;  // X軸右部
  xLeft: string;   // X軸左部
}

interface AxisCoordinateInputProps {
  values: AxisData;
  onChange: (values: AxisData) => void;
}

const AxisCoordinateInput: React.FC<AxisCoordinateInputProps> = ({
  values,
  onChange,
}) => {
  const handleChange = (direction: keyof AxisData, value: string) => {
    onChange({
      ...values,
      [direction]: value,
    });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
      <Paper
        elevation={2}
        sx={{
          width: 400,
          height: 400,
          position: "relative",
          backgroundColor: "#fafafa",
          border: "2px solid #e0e0e0",
          borderRadius: 3,
        }}
      >
        {/* 中央のタイトル */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            backgroundColor: "white",
            px: 2,
            py: 1,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            zIndex: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            診断軸
          </Typography>
          <Typography variant="caption" color="text.secondary">
            4つの指標
          </Typography>
        </Box>

        {/* Y軸上部 */}
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Y軸上部の指標"
            value={values.yTop}
            onChange={(e) => handleChange("yTop", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                textAlign: "center",
                "& input": {
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 0.5,
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            Y軸上部
          </Typography>
        </Box>

        {/* Y軸下部 */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mb: 0.5,
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            Y軸下部
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Y軸下部の指標"
            value={values.yBottom}
            onChange={(e) => handleChange("yBottom", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                textAlign: "center",
                "& input": {
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                },
              },
            }}
          />
        </Box>

        {/* X軸右部 */}
        <Box
          sx={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 120,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="X軸右部の指標"
            value={values.xRight}
            onChange={(e) => handleChange("xRight", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                textAlign: "center",
                "& input": {
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 0.5,
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            X軸右部
          </Typography>
        </Box>

        {/* X軸左部 */}
        <Box
          sx={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 120,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="X軸左部の指標"
            value={values.xLeft}
            onChange={(e) => handleChange("xLeft", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                textAlign: "center",
                "& input": {
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 0.5,
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            X軸左部
          </Typography>
        </Box>

        {/* 座標軸線 */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 60,
            right: 60,
            height: 2,
            backgroundColor: "#ddd",
            transform: "translateY(-50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 60,
            bottom: 60,
            width: 2,
            backgroundColor: "#ddd",
            transform: "translateX(-50%)",
          }}
        />
      </Paper>
    </Box>
  );
};

export default AxisCoordinateInput;