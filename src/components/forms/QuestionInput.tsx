import {
  Box,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { ChangeEvent } from "react";

import QuizHeart from "../quiz/HeartIcon";

import { Question } from "@/types/quiz";


interface QuestionInputProps {
  question: Question;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}

export default function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  const handleScaleChange = (newValue: number) => {
    onChange(newValue);
  };

  const handleMultipleChoiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleYesNoChange = (answer: boolean) => {
    onChange(answer);
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "scale":
        return (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              当てはまる度合いを選んでください
            </Typography>
            <QuizHeart
              selectedValue={typeof value === "number" ? value : undefined}
              onValueChange={handleScaleChange}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, px: 2 }}>
              <Typography variant="caption" color="text.secondary">
                全くそう思わない
              </Typography>
              <Typography variant="caption" color="text.secondary">
                とてもそう思う
              </Typography>
            </Box>
          </Box>
        );

      case "multiple_choice":
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              当てはまるものを選んでください
            </Typography>
            <RadioGroup
              value={value || ""}
              onChange={handleMultipleChoiceChange}
              sx={{ pl: 2 }}
            >
              {question.options?.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <FormControlLabel
                    value={option}
                    control={<Radio sx={{ color: "#007AFF" }} />}
                    label={
                      <Typography variant="body1" sx={{ fontSize: "1rem" }}>
                        {option}
                      </Typography>
                    }
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "rgba(0, 122, 255, 0.05)",
                      },
                    }}
                  />
                </motion.div>
              ))}
            </RadioGroup>
          </Box>
        );

      case "text":
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              自由にお答えください
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              variant="outlined"
              placeholder="こちらにご記入ください..."
              value={value || ""}
              onChange={handleTextChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:focus-within": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#007AFF",
                    },
                  },
                },
              }}
            />
          </Box>
        );

      case "yes_no":
        return (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              はい・いいえでお答えください
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={value === true ? "contained" : "outlined"}
                  onClick={() => handleYesNoChange(true)}
                  sx={{
                    minWidth: 120,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    backgroundColor: value === true ? "#007AFF" : "transparent",
                    borderColor: "#007AFF",
                    color: value === true ? "white" : "#007AFF",
                    "&:hover": {
                      backgroundColor: value === true ? "#0056CC" : "rgba(0, 122, 255, 0.1)",
                    },
                  }}
                >
                  はい
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={value === false ? "contained" : "outlined"}
                  onClick={() => handleYesNoChange(false)}
                  sx={{
                    minWidth: 120,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    backgroundColor: value === false ? "#FF3B30" : "transparent",
                    borderColor: "#FF3B30",
                    color: value === false ? "white" : "#FF3B30",
                    "&:hover": {
                      backgroundColor: value === false ? "#D70015" : "rgba(255, 59, 48, 0.1)",
                    },
                  }}
                >
                  いいえ
                </Button>
              </motion.div>
            </Box>
          </Box>
        );

      default:
        return (
          <Box sx={{ py: 2, textAlign: "center" }}>
            <Typography color="error">
              サポートされていない質問タイプ: {question.type}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 3,
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {question.text}
        </Typography>
        {renderQuestionInput()}
      </Box>
    </motion.div>
  );
}