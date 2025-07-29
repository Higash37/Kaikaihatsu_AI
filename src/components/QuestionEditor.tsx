import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Delete, Refresh, Edit, Check, Close } from "@mui/icons-material";
import React, { useState } from "react";

interface Question {
  id: string;
  text: string;
  axisWeights: {
    x: number; // -1 to 1
    y: number; // -1 to 1
  };
}

interface Axis {
  id: number;
  name: string;
  description: string;
  positiveName: string;
  negativeName: string;
}

interface QuestionEditorProps {
  questions: Question[];
  axes: Axis[];
  theme: string;
  resultType: string;
  onChange: (questions: Question[]) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  axes,
  theme,
  resultType,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const generateQuestions = async () => {
    if (!theme || axes.length < 2) {
      setError("テーマと軸設定が必要です。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          resultType,
          axes,
          questionCount: 10,
          results: [], // 必要に応じて結果配置情報も送信
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "質問の生成に失敗しました。");
      }

      const data = await response.json();
      onChange(data.questions);
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      text: "",
      axisWeights: { x: 0, y: 0 },
    };
    onChange([...questions, newQuestion]);
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    onChange(updatedQuestions);
  };

  const deleteQuestion = (questionId: string) => {
    onChange(questions.filter(q => q.id !== questionId));
    if (editingQuestion === questionId) {
      setEditingQuestion(null);
    }
  };


  const getAxisWeightColor = (weight: number) => {
    const intensity = Math.abs(weight);
    if (intensity > 0.7) return "#667eea";
    if (intensity > 0.3) return "#94a9ff";
    return "#c7d2fe";
  };

  const renderQuestionCard = (question: Question, index: number) => {
    const isEditing = editingQuestion === question.id;

    return (
      <Card key={question.id} sx={{ mb: 2, position: "relative" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Typography variant="h6" sx={{ color: "#667eea", fontWeight: 600 }}>
              質問 {index + 1}
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={() => setEditingQuestion(isEditing ? null : question.id)}
                sx={{ mr: 1 }}
              >
                {isEditing ? <Check /> : <Edit />}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => deleteQuestion(question.id)}
                sx={{ color: "#ff4444" }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          {isEditing ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="質問文"
                value={question.text}
                onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}>
                回答者は5段階のハート評価（1〜5ハート）で回答します
              </Typography>

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                軸への影響度
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>X軸への影響</InputLabel>
                    <Select
                      value={question.axisWeights.x}
                      label="X軸への影響"
                      onChange={(e) => updateQuestion(question.id, {
                        axisWeights: { ...question.axisWeights, x: Number(e.target.value) }
                      })}
                    >
                      <MenuItem value={-1}>強く左側</MenuItem>
                      <MenuItem value={-0.5}>左側寄り</MenuItem>
                      <MenuItem value={0}>影響なし</MenuItem>
                      <MenuItem value={0.5}>右側寄り</MenuItem>
                      <MenuItem value={1}>強く右側</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Y軸への影響</InputLabel>
                    <Select
                      value={question.axisWeights.y}
                      label="Y軸への影響"
                      onChange={(e) => updateQuestion(question.id, {
                        axisWeights: { ...question.axisWeights, y: Number(e.target.value) }
                      })}
                    >
                      <MenuItem value={1}>強く上側</MenuItem>
                      <MenuItem value={0.5}>上側寄り</MenuItem>
                      <MenuItem value={0}>影響なし</MenuItem>
                      <MenuItem value={-0.5}>下側寄り</MenuItem>
                      <MenuItem value={-1}>強く下側</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                {question.text || "質問文が入力されていません"}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}>
                💛💛💛💛💛 （5段階ハート評価で回答）
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label={`X軸: ${question.axisWeights.x > 0 ? '+' : ''}${question.axisWeights.x}`}
                  size="small"
                  sx={{
                    backgroundColor: getAxisWeightColor(question.axisWeights.x),
                    color: Math.abs(question.axisWeights.x) > 0.5 ? "white" : "black",
                  }}
                />
                <Chip
                  label={`Y軸: ${question.axisWeights.y > 0 ? '+' : ''}${question.axisWeights.y}`}
                  size="small"
                  sx={{
                    backgroundColor: getAxisWeightColor(question.axisWeights.y),
                    color: Math.abs(question.axisWeights.y) > 0.5 ? "white" : "black",
                  }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* AIで質問生成 */}
      <Paper sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          AI質問生成
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          設定されたテーマと軸に基づいて、AIが最適な質問を自動生成します
        </Typography>
        <Button
          variant="contained"
          onClick={generateQuestions}
          disabled={loading}
          sx={{
            backgroundColor: "#667eea",
            "&:hover": { backgroundColor: "#5a67d8" },
            minWidth: 200,
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <Refresh sx={{ mr: 1 }} />
              質問を生成
            </>
          )}
        </Button>
      </Paper>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 質問一覧 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            質問一覧 ({questions.length}問)
          </Typography>
          <Button
            variant="outlined"
            onClick={addNewQuestion}
            sx={{
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5a67d8",
                backgroundColor: "rgba(102, 126, 234, 0.04)",
              },
            }}
          >
            <Add sx={{ mr: 1 }} />
            質問を追加
          </Button>
        </Box>

        {questions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
            <Typography>
              まだ質問が作成されていません。<br />
              「質問を生成」ボタンでAIに質問を作成してもらうか、「質問を追加」で手動で作成してください。
            </Typography>
          </Paper>
        ) : (
          questions.map((question, index) => renderQuestionCard(question, index))
        )}
      </Box>

      {/* 軸の参考情報 */}
      <Paper sx={{ p: 2, backgroundColor: "#f8f9ff" }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          軸の設定参考
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#667eea" }}>
              X軸 (横軸): {axes[0]?.name || "未設定"}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              左側: {axes[0]?.negativeName || "未設定"}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              右側: {axes[0]?.positiveName || "未設定"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#667eea" }}>
              Y軸 (縦軸): {axes[1]?.name || "未設定"}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              上側: {axes[1]?.positiveName || "未設定"}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              下側: {axes[1]?.negativeName || "未設定"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default QuestionEditor;