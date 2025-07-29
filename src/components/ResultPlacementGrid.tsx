import { Box, Typography, Paper, Chip, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Add, Edit, Delete, GridOn, GridOff } from "@mui/icons-material";
import React, { useState } from "react";

interface Result {
  id: string;
  name: string;
  description: string;
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (bottom to top)
}

interface AxisData {
  yTop: string;
  yBottom: string;
  xRight: string;
  xLeft: string;
}

interface ResultPlacementGridProps {
  results: Result[];
  axisData: AxisData;
  onChange: (results: Result[]) => void;
}

type PlacementMode = "free" | "template-4" | "template-8" | "template-16";

const ResultPlacementGrid: React.FC<ResultPlacementGridProps> = ({
  results,
  axisData,
  onChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newResultName, setNewResultName] = useState("");
  const [newResultDescription, setNewResultDescription] = useState("");
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [placementMode, setPlacementMode] = useState<PlacementMode>("template-16");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const GRID_SIZE = 300;
  
  // 配置モードに応じたボックスサイズを計算
  const getResultSize = (mode: PlacementMode): { width: number, height: number } => {
    switch (mode) {
      case "template-4":
        return { width: GRID_SIZE / 2, height: GRID_SIZE / 2 }; // 象限全体
      case "template-8":
        return { width: GRID_SIZE / 2, height: GRID_SIZE / 4 }; // 象限の半分
      case "template-16":
        return { width: GRID_SIZE / 4, height: GRID_SIZE / 4 }; // 1/4象限
      default:
        return { width: 60, height: 60 }; // フリーモード
    }
  };
  
  const RESULT_SIZE = getResultSize(placementMode);

  // テンプレート配置の座標を取得する関数
  const getTemplatePositions = (mode: PlacementMode): { x: number; y: number }[] => {
    switch (mode) {
      case "template-4":
        return [
          { x: 0.5, y: 0.5 },   // 右上象限の中心
          { x: -0.5, y: 0.5 },  // 左上象限の中心
          { x: 0.5, y: -0.5 },  // 右下象限の中心
          { x: -0.5, y: -0.5 }  // 左下象限の中心
        ];
      case "template-8":
        return [
          { x: 0.5, y: 0.75 },  // 右上の上
          { x: 0.5, y: 0.25 },  // 右上の下
          { x: -0.5, y: 0.75 }, // 左上の上
          { x: -0.5, y: 0.25 }, // 左上の下
          { x: -0.5, y: -0.25 }, // 左下の上
          { x: -0.5, y: -0.75 }, // 左下の下
          { x: 0.5, y: -0.25 },  // 右下の上
          { x: 0.5, y: -0.75 }   // 右下の下
        ];
      case "template-16":
        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            positions.push({
              x: -0.75 + (j * 0.5),
              y: 0.75 - (i * 0.5)
            });
          }
        }
        return positions;
      default:
        return [];
    }
  };

  const templatePositions = getTemplatePositions(placementMode);
  const maxResults = placementMode === "free" ? Infinity : 
                    placementMode === "template-4" ? 4 :
                    placementMode === "template-8" ? 8 : 16;

  const convertToPixels = (x: number, y: number) => ({
    x: ((x + 1) / 2) * GRID_SIZE - RESULT_SIZE.width / 2,
    y: ((1 - y) / 2) * GRID_SIZE - RESULT_SIZE.height / 2, // Y軸を反転
  });

  const convertFromPixels = (pixelX: number, pixelY: number) => ({
    x: (pixelX + RESULT_SIZE.width / 2) / GRID_SIZE * 2 - 1,
    y: 1 - ((pixelY + RESULT_SIZE.height / 2) / GRID_SIZE * 2), // Y軸を反転
  });

  const handleResultDrag = (resultId: string, pixelX: number, pixelY: number) => {
    // ドラッグ中は視覚的な位置のみ更新（座標値は更新しない）
    const coords = convertFromPixels(pixelX, pixelY);
    const updatedResults = results.map(r =>
      r.id === resultId
        ? { ...r, x: Math.max(-1, Math.min(1, coords.x)), y: Math.max(-1, Math.min(1, coords.y)) }
        : r
    );
    onChange(updatedResults);
  };

  const addNewResult = () => {
    if (!newResultName.trim()) return;

    const newResult: Result = {
      id: `result_${Date.now()}`,
      name: newResultName,
      description: newResultDescription,
      x: clickPosition.x,
      y: clickPosition.y,
    };

    onChange([...results, newResult]);
    setNewResultName("");
    setNewResultDescription("");
    setSelectedSlot(null);
    setShowModal(false);
  };

  // ドラッグ終了時の処理
  const handleDragEnd = (result: Result, newX: number, newY: number) => {
    const coords = convertFromPixels(newX, newY);
    const finalX = Math.max(-1, Math.min(1, coords.x));
    const finalY = Math.max(-1, Math.min(1, coords.y));
    
    if (placementMode === "free") {
      // フリーモード: そのまま配置
      const updatedResults = results.map(r =>
        r.id === result.id ? { ...r, x: finalX, y: finalY } : r
      );
      onChange(updatedResults);
    } else {
      // テンプレートモード: 最寄りの空きスロットを探す
      let bestSlot = null;
      let minDistance = Infinity;
      
      templatePositions.forEach((pos, index) => {
        const isOccupied = results.some(r => 
          r.id !== result.id && Math.abs(r.x - pos.x) < 0.15 && Math.abs(r.y - pos.y) < 0.15
        );
        
        if (!isOccupied) {
          const distance = Math.sqrt(Math.pow(finalX - pos.x, 2) + Math.pow(finalY - pos.y, 2));
          if (distance < minDistance) {
            minDistance = distance;
            bestSlot = pos;
          }
        }
      });
      
      // 空きスロットが見つかった場合はスナップ、見つからない場合は元の位置に戻す
      const targetPosition = bestSlot || { x: result.x, y: result.y };
      const updatedResults = results.map(r =>
        r.id === result.id ? { ...r, x: targetPosition.x, y: targetPosition.y } : r
      );
      onChange(updatedResults);
    }
  };

  const handleGridClick = (event: React.MouseEvent) => {
    if (placementMode === "free") {
      // フリーモード: クリック位置に配置
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const coords = convertFromPixels(x - RESULT_SIZE / 2, y - RESULT_SIZE / 2);
      setClickPosition({
        x: Math.max(-1, Math.min(1, coords.x)),
        y: Math.max(-1, Math.min(1, coords.y))
      });
      setSelectedSlot(null);
      setShowModal(true);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (results.length >= maxResults) return;
    
    const position = templatePositions[slotIndex];
    setClickPosition(position);
    setSelectedSlot(slotIndex);
    setShowModal(true);
  };

  const deleteResult = (resultId: string) => {
    onChange(results.filter(r => r.id !== resultId));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {/* 配置モード切り替え */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          配置モード
        </Typography>
        <ToggleButtonGroup
          value={placementMode}
          exclusive
          onChange={(_, newMode) => {
            if (newMode) {
              setPlacementMode(newMode);
            }
          }}
          size="small"
        >
          <ToggleButton value="free">
            <GridOff sx={{ mr: 1, fontSize: 16 }} />
            フリー
          </ToggleButton>
          <ToggleButton value="template-4">
            4箇所
          </ToggleButton>
          <ToggleButton value="template-8">
            8箇所
          </ToggleButton>
          <ToggleButton value="template-16">
            16箇所
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 座標グリッド */}
      <Paper
        elevation={2}
        onClick={handleGridClick}
        sx={{
          width: GRID_SIZE,
          height: GRID_SIZE,
          position: "relative",
          backgroundColor: "#fafafa",
          border: "2px solid #e0e0e0",
          borderRadius: 3,
          cursor: placementMode === "free" ? "pointer" : "default",
          "&:hover": {
            backgroundColor: placementMode === "free" ? "#f0f0f0" : "#fafafa",
            borderColor: placementMode === "free" ? "#667eea" : "#e0e0e0",
          },
        }}
      >
        {/* Y軸上部ラベル */}
        <Box
          sx={{
            position: "absolute",
            top: -30,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#667eea" }}>
            {axisData.yTop}
          </Typography>
        </Box>

        {/* Y軸下部ラベル */}
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#667eea" }}>
            {axisData.yBottom}
          </Typography>
        </Box>

        {/* X軸右部ラベル */}
        <Box
          sx={{
            position: "absolute",
            right: -60,
            top: "50%",
            transform: "translateY(-50%)",
            textAlign: "center",
            width: 50,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#667eea" }}>
            {axisData.xRight}
          </Typography>
        </Box>

        {/* X軸左部ラベル */}
        <Box
          sx={{
            position: "absolute",
            left: -60,
            top: "50%",
            transform: "translateY(-50%)",
            textAlign: "center",
            width: 50,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#667eea" }}>
            {axisData.xLeft}
          </Typography>
        </Box>

        {/* 座標軸線 */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "#ddd",
            transform: "translateY(-50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: "#ddd",
            transform: "translateX(-50%)",
          }}
        />

        {/* テンプレートスロット表示 */}
        {placementMode !== "free" && templatePositions.map((pos, index) => {
          const position = convertToPixels(pos.x, pos.y);
          const isOccupied = results.some(r => 
            Math.abs(r.x - pos.x) < 0.1 && Math.abs(r.y - pos.y) < 0.1
          );
          
          if (isOccupied) return null;
          
          return (
            <Box
              key={`slot-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSlotClick(index);
              }}
              sx={{
                position: "absolute",
                left: position.x,
                top: position.y,
                width: RESULT_SIZE.width,
                height: RESULT_SIZE.height,
                border: placementMode === "template-4" ? "3px dashed #667eea" : "2px dashed #667eea",
                borderRadius: placementMode === "template-4" ? 3 : 2,
                cursor: results.length < maxResults ? "pointer" : "not-allowed",
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: results.length < maxResults ? 0.7 : 0.3,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  opacity: results.length < maxResults ? 1 : 0.3,
                  backgroundColor: "rgba(102, 126, 234, 0.2)",
                },
                zIndex: 5,
              }}
            >
              <Add sx={{ 
                color: "#667eea", 
                fontSize: placementMode === "template-4" ? 48 : 
                         placementMode === "template-8" ? 32 : 20 
              }} />
            </Box>
          );
        })}

        {/* 結果の配置 */}
        {results.map((result) => {
          const position = convertToPixels(result.x, result.y);
          return (
            <Box
              key={result.id}
              sx={{
                position: "absolute",
                left: position.x,
                top: position.y,
                width: RESULT_SIZE.width,
                height: RESULT_SIZE.height,
                cursor: "move",
                zIndex: 10,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                
                let hasMoved = false;
                let currentX = position.x;
                let currentY = position.y;
                const startX = e.clientX - position.x;
                const startY = e.clientY - position.y;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  hasMoved = true;
                  const newX = moveEvent.clientX - startX;
                  const newY = moveEvent.clientY - startY;
                  
                  // グリッド内に制限
                  const boundedX = Math.max(0, Math.min(GRID_SIZE - RESULT_SIZE.width, newX));
                  const boundedY = Math.max(0, Math.min(GRID_SIZE - RESULT_SIZE.height, newY));
                  
                  currentX = boundedX;
                  currentY = boundedY;
                  
                  // リアルタイムで位置更新
                  handleResultDrag(result.id, boundedX, boundedY);
                };

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                  
                  if (hasMoved) {
                    // ドラッグ終了時の最終処理
                    handleDragEnd(result, currentX, currentY);
                  }
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              }}
              onClick={(e) => {
                e.stopPropagation(); // クリック時もグリッドクリックを防止
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 2,
                  backgroundColor: "#667eea",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  p: 1,
                  position: "relative",
                  "&:hover": {
                    backgroundColor: "#5a67d8",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteResult(result.id);
                  }}
                  sx={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "#ff4444",
                    color: "white",
                    width: 16,
                    height: 16,
                    "&:hover": {
                      backgroundColor: "#cc0000",
                    },
                  }}
                >
                  <Delete sx={{ fontSize: 10 }} />
                </IconButton>
                
                <Typography variant="caption" sx={{ 
                  fontWeight: 600, 
                  fontSize: placementMode === "template-4" ? "1.2rem" : 
                           placementMode === "template-8" ? "0.9rem" : "0.65rem",
                  lineHeight: 1.1
                }}>
                  {result.name}
                </Typography>
                {result.description && (
                  <Typography variant="caption" sx={{ 
                    fontSize: placementMode === "template-4" ? "1rem" : 
                             placementMode === "template-8" ? "0.75rem" : "0.55rem",
                    opacity: 0.8,
                    lineHeight: 1
                  }}>
                    {placementMode === "template-4" 
                      ? (result.description.length > 25 ? result.description.substring(0, 25) + "..." : result.description)
                      : placementMode === "template-8"
                      ? (result.description.length > 15 ? result.description.substring(0, 15) + "..." : result.description)  
                      : (result.description.length > 8 ? result.description.substring(0, 8) + "..." : result.description)
                    }
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}
      </Paper>

      {/* 説明テキスト */}
      <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", maxWidth: 400 }}>
        座標グラフをクリックして新しい診断結果を追加できます。配置済みの結果はドラッグで移動できます。
      </Typography>

      {/* 配置された結果一覧 */}
      <Box sx={{ width: "100%", maxWidth: 500 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "center", fontWeight: 600 }}>
          配置された診断結果 ({results.length}個)
        </Typography>
        
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
          {results.map((result) => (
            <Chip
              key={result.id}
              label={`${result.name} (${Math.round(result.x * 10) / 10}, ${Math.round(result.y * 10) / 10})`}
              variant="outlined"
              size="small"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                "& .MuiChip-label": {
                  fontSize: "0.75rem",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* モーダル */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          診断結果を追加
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "center", color: "text.secondary" }}>
            {selectedSlot !== null 
              ? `スロット ${selectedSlot + 1} に配置します`
              : `座標 (${clickPosition.x.toFixed(2)}, ${clickPosition.y.toFixed(2)}) に配置します`
            }
          </Typography>
          
          <TextField
            fullWidth
            label="結果名"
            value={newResultName}
            onChange={(e) => setNewResultName(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="例：チャレンジャー"
            autoFocus
          />
          
          <TextField
            fullWidth
            label="説明（オプション）"
            value={newResultDescription}
            onChange={(e) => setNewResultDescription(e.target.value)}
            placeholder="例：新しいことに積極的に挑戦する"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={addNewResult}
            disabled={!newResultName.trim()}
            sx={{
              backgroundColor: "#667eea !important",
              color: "#ffffff !important",
              "&:hover": {
                backgroundColor: "#5a67d8 !important",
              },
              "&:disabled": {
                backgroundColor: "#cccccc !important",
                color: "#888888 !important",
              },
            }}
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultPlacementGrid;