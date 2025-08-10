import { AutoAwesome, Settings } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import React from "react";

interface CreateModeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectMode: (mode: "auto" | "wizard") => void;
}

const CreateModeModal: React.FC<CreateModeModalProps> = ({
  open,
  onClose,
  onSelectMode,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.5rem",
          color: "#333",
          pb: 1,
        }}
      >
        作成方法を選択
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, pb: 3 }}>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "text.secondary",
            mb: 3,
          }}
        >
          アンケートの作成方法を選択してください
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* 全自動作成 */}
          <Card
            sx={{
              cursor: "pointer",
              border: "2px solid transparent",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#667eea",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
            onClick={() => onSelectMode("auto")}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AutoAwesome sx={{ color: "#667eea", mr: 2, fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    全自動作成
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI が全て自動で設定
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                テーマを入力するだけで、AI が指標・結果・質問を自動生成します。
                手軽に作成したい場合におすすめです。
              </Typography>
              <Box>
                <Chip label="簡単" size="small" color="primary" />
                <Chip label="高速" size="small" sx={{ ml: 1 }} />
              </Box>
            </CardContent>
          </Card>

          {/* 段階的作成 */}
          <Card
            sx={{
              cursor: "pointer",
              border: "2px solid #667eea",
              backgroundColor: "rgba(102, 126, 234, 0.02)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#5a67d8",
                boxShadow: "0 6px 24px rgba(102, 126, 234, 0.2)",
                transform: "translateY(-2px)",
              },
            }}
            onClick={() => onSelectMode("wizard")}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Settings sx={{ color: "#667eea", mr: 2, fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    段階的作成
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      詳細設定が可能
                    </Typography>
                    <Chip
                      label="推奨"
                      size="small"
                      sx={{
                        ml: 1,
                        backgroundColor: "#667eea",
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                指標の設定、結果の配置、質問内容を段階的にカスタマイズできます。
                より精密な診断を作成したい場合におすすめです。
              </Typography>
              <Box>
                <Chip label="カスタマイズ" size="small" color="primary" />
                <Chip label="高品質" size="small" sx={{ ml: 1 }} />
                <Chip label="推奨" size="small" sx={{ ml: 1, backgroundColor: "#667eea", color: "white" }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="text"
            onClick={onClose}
            sx={{ color: "text.secondary" }}
          >
            キャンセル
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModeModal;