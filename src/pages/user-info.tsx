import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";

import Header from "@/components/Header";
import Pulldown from "@/components/Pulldown";

// CircleBoxのProps定義
interface CircleBoxProps {
  onClick: () => void;
  selected: boolean;
  genderType: "male" | "female"; // 性別タイプを追加
}

// CircleBoxコンポーネント
const CircleBox: React.FC<CircleBoxProps> = ({
  onClick,
  selected,
  genderType,
}) => {
  const theme = useTheme();
  const color =
    genderType === "male"
      ? theme.palette.primary.main
      : theme.palette.secondary.main; // テーマの色を使用

  return (
    <Box
      component={motion.div}
      onClick={onClick}
      sx={{ position: "relative", textAlign: "center", zIndex: 1 }}
    >
      {selected && (
        <Box
          component={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: color,
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      )}
      <Box
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        sx={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          border: `2px solid ${selected ? color : theme.palette.divider}`,
          backgroundColor: selected ? color : theme.palette.background.paper,
          opacity: selected ? 1 : 0.9,
          transition: "all 0.3s ease",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: selected
            ? theme.palette.common.white
            : theme.palette.text.primary,
          fontWeight: "bold",
          fontSize: "1.5rem",
        }}
      >
        {genderType === "male" ? "♂" : "♀"}
      </Box>
    </Box>
  );
};

const PersonalInfoForm: React.FC = () => {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const theme = useTheme();

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleSubmit = () => {
    if (!selectedGender) {
      alert("性別を選択してください");
      return;
    }
    if (!selectedAge) {
      alert("年齢を選択してください");
      return;
    }

    // **既存の `userScores` を取得**
    const storedScores = localStorage.getItem("userScores");
    const parsedScores = storedScores ? JSON.parse(storedScores) : null;

    if (!parsedScores) {
      console.error("❌ 診断スコアが `localStorage` に存在しません！");
      return;
    }

    // **新しいユーザー情報を作成**
    const newUserInfo = {
      ...parsedScores, // 診断スコアを含める
      gender: selectedGender,
      age: selectedAge,
    };

    // **`localStorage` に保存**
    localStorage.setItem("userInfo", JSON.stringify(newUserInfo));

    // **結果ページへ遷移**
    router.push("/result");
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        paddingTop: { xs: "70px", sm: "80px" }, // ヘッダー分のマージン
      }}
    >
      <Header />
      <Box sx={{ pt: "100px", px: "16px" }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          sx={{
            maxWidth: "500px",
            mx: "auto",
            textAlign: "center",
            p: "20px",
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: "20px",
              color: theme.palette.text.primary,
            }}
          >
            あなたの情報を入力してください
          </Typography>

          {/* 性別選択 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              mb: "20px",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <CircleBox
                onClick={() => handleGenderSelect("male")}
                selected={selectedGender === "male"}
                genderType="male"
              />
              <Typography
                variant="body2"
                sx={{ mt: "10px", color: theme.palette.text.secondary }}
              >
                男性
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <CircleBox
                onClick={() => handleGenderSelect("female")}
                selected={selectedGender === "female"}
                genderType="female"
              />
              <Typography
                variant="body2"
                sx={{ mt: "10px", color: theme.palette.text.secondary }}
              >
                女性
              </Typography>
            </Box>
          </Box>

          {/* 選択結果とプルダウン */}
          {selectedGender && (
            <Box sx={{ mt: "20px" }}>
              <Typography
                variant="body1"
                sx={{ mb: "10px", color: theme.palette.text.primary }}
              >
                選択された性別：{selectedGender === "male" ? "男性" : "女性"}
              </Typography>

              <Pulldown
                label="年齢を選択してください："
                options={Array.from({ length: 100 }, (_, i) => i + 1)}
                value={selectedAge}
                onChange={(value) => setSelectedAge(value)}
              />
            </Box>
          )}

          {/* 送信ボタン */}
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            sx={{
              mt: "30px",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              fontSize: "1.1rem",
              p: "10px 20px",
              borderRadius: theme.shape.borderRadius,
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            アンケートを完了する
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PersonalInfoForm;
