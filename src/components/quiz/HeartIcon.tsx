import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

// 指定のボタン位置にスクロール
const scrollToNextButton = (currentQuestionId: number) => {
  const nextButton = document.getElementById(
    `question-${currentQuestionId + 1}`
  );
  if (nextButton) {
    const startY = window.scrollY;
    const targetY =
      nextButton.getBoundingClientRect().top +
      window.scrollY -
      window.innerHeight * 0.4;
    const duration = 500;

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeInOutCubic =
        percentage < 0.5
          ? 4 * percentage * percentage * percentage
          : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

      window.scrollTo(0, startY + (targetY - startY) * easeInOutCubic);
      if (progress < duration) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
};

// Props型定義
type Props = {
  onClick?: () => void;
  selected: boolean;
  size?: number;
  questionId: number; // 質問ID
};

// ハート型SVGコンポーネント
const HeartShape: React.FC<Props> = ({
  onClick,
  selected,
  size = 100,
  questionId,
}) => {
  const theme = useTheme(); // テーマを取得
  const primaryColor = theme.palette.primary.main; // プライマリカラー

  const handleClick = () => {
    if (onClick) onClick();

    if (selected) return;

    setTimeout(() => {
      scrollToNextButton(questionId);
    }, 100);
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      initial={{ scale: 1.0 }}
      whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
      whileTap={{ scale: 1.1, transition: { duration: 0.2 } }}
      style={{
        cursor: "pointer",
        display: "inline-block",
        outline: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      onClick={handleClick}
    >
      <motion.path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3
             c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3
             19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={selected ? primaryColor : "transparent"}
        stroke={selected ? primaryColor : "#d3d3d3"}
        strokeWidth="0.5"
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  );
};

// 各CircleBoxコンポーネント
const CircleBoxBigleft: React.FC<Props> = (props) => (
  <HeartShape {...props} size={130} />
);

const CircleBoxMiddleLeft: React.FC<Props> = (props) => (
  <HeartShape {...props} size={110} />
);

const CircleBoxSmall: React.FC<Props> = (props) => (
  <HeartShape {...props} size={90} />
);

const CircleBoxMiddleRight: React.FC<Props> = (props) => (
  <HeartShape {...props} size={110} />
);

const CircleBoxBigright: React.FC<Props> = (props) => (
  <HeartShape {...props} size={130} />
);

// スケール入力コンポーネントのProps
interface QuizHeartProps {
  selectedValue?: number;
  onValueChange: (value: number) => void;
}

// スケール入力コンポーネント（1-5のハート選択）
const QuizHeart: React.FC<QuizHeartProps> = ({ selectedValue, onValueChange }) => {
  const heartComponents = [
    CircleBoxBigleft,
    CircleBoxMiddleLeft,
    CircleBoxSmall,
    CircleBoxMiddleRight,
    CircleBoxBigright,
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
      {heartComponents.map((HeartComponent, index) => {
        const value = index + 1;
        return (
          <HeartComponent
            key={index}
            onClick={() => onValueChange(value)}
            selected={selectedValue === value}
            questionId={0} // スケール質問では自動スクロールは不要
          />
        );
      })}
    </div>
  );
};

// エクスポート
export {
  CircleBoxBigleft,
  CircleBoxMiddleLeft,
  CircleBoxSmall,
  CircleBoxMiddleRight,
  CircleBoxBigright,
};

export default QuizHeart;
