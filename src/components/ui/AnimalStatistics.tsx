import Typography from "@mui/material/Typography";
import Box from "@mui/system/Box";
import Image from "next/legacy/image";
import React from "react";

import { GaugeProps } from "@/types";

const Gauge: React.FC<GaugeProps> = ({
  initialValue = 0, // デフォルト値を 0 に変更
  imageSrc = "/example.png",
  label = "",
  progressColor,
}) => {
  // NaN チェックを追加
  let validPercentage = isNaN(initialValue)
    ? 0
    : Math.min(100, Math.max(0, initialValue));
  const barColor = progressColor || "rgb(4, 138, 191)";

  // 座標 (0, 0) のデータを除外する（ただしゲージ自体は表示）
  if (initialValue === 0) {
    validPercentage = 0; // 0 のデータは無視する
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        marginBottom: "5px",
      }}
    >
      {label && (
        <Typography
          variant="subtitle1"
          sx={{ mb: "6px", textAlign: "center", fontWeight: "bold" }}
        >
          {label}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 50,
            width: 50,
            marginRight: "10px",
            top: "-5px",
          }}
        >
          <Image src={imageSrc} alt="Icon" layout="fill" objectFit="contain" />
        </Box>

        <Box sx={{ width: "85%" }}>
          <Box
            sx={{
              width: "100%",
              height: 20,
              backgroundColor: "#e0e0e0",
              borderRadius: 10,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                height: "100%",
                backgroundColor: barColor,
                borderRadius: "inherit",
                transition: "width 0.3s ease-in-out",
                width: `${validPercentage}%`,
              }}
            />
          </Box>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              mt: "3px",
              height: 25,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: `${validPercentage}%`,
                transform: "translateX(-50%)",
                color: "#333",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              {validPercentage}%
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Gauge;
