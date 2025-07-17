import { Person } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
} from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/contexts/AuthContext";

interface UserProfileData {
  age: number;
  gender: string;
  prefecture: string;
  city: string;
  occupation: string;
  education: string;
  allowDataCollection: boolean;
  allowLocationTracking: boolean;
  shareProfileData: boolean;
}

interface UserProfileFormProps {
  onProfileUpdate?: (profile: UserProfileData) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  onProfileUpdate,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData>({
    age: 0,
    gender: "",
    prefecture: "",
    city: "",
    occupation: "",
    education: "",
    allowDataCollection: false,
    allowLocationTracking: false,
    shareProfileData: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ];

  const occupations = [
    "会社員",
    "公務員",
    "自営業",
    "フリーランス",
    "学生",
    "主婦・主夫",
    "アルバイト・パート",
    "経営者",
    "研究者",
    "教員",
    "医療従事者",
    "エンジニア",
    "デザイナー",
    "営業",
    "企画・マーケティング",
    "その他",
  ];

  const educationLevels = [
    { value: "high_school", label: "高等学校" },
    { value: "college", label: "短期大学・専門学校" },
    { value: "university", label: "大学" },
    { value: "graduate", label: "大学院" },
    { value: "other", label: "その他" },
  ];

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("プロフィール読み込みエラー:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...profile,
        }),
      });

      if (!response.ok) {
        throw new Error("プロフィールの保存に失敗しました");
      }

      if (onProfileUpdate) {
        onProfileUpdate(profile);
      }
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfileData, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getAgeRange = (age: number): string => {
    if (age < 20) return "10代";
    if (age < 30) return "20代";
    if (age < 40) return "30代";
    if (age < 50) return "40代";
    if (age < 60) return "50代";
    if (age < 70) return "60代";
    return "70代以上";
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 3, display: "flex", alignItems: "center" }}
          >
            <Person sx={{ mr: 1 }} />
            プロフィール設定
          </Typography>

          <Grid container spacing={3}>
            {/* 基本情報 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="年齢"
                type="number"
                value={profile.age || ""}
                onChange={(e) =>
                  handleInputChange("age", parseInt(e.target.value) || 0)
                }
                helperText={
                  profile.age > 0 ? `${getAgeRange(profile.age)}` : ""
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>性別</InputLabel>
                <Select
                  value={profile.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <MenuItem value="male">男性</MenuItem>
                  <MenuItem value="female">女性</MenuItem>
                  <MenuItem value="other">その他</MenuItem>
                  <MenuItem value="prefer_not_to_say">回答しない</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 居住地情報 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>都道府県</InputLabel>
                <Select
                  value={profile.prefecture}
                  onChange={(e) =>
                    handleInputChange("prefecture", e.target.value)
                  }
                >
                  {prefectures.map((pref) => (
                    <MenuItem key={pref} value={pref}>
                      {pref}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="市区町村"
                value={profile.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </Grid>

            {/* 職業・学歴 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>職業</InputLabel>
                <Select
                  value={profile.occupation}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                >
                  {occupations.map((job) => (
                    <MenuItem key={job} value={job}>
                      {job}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>最終学歴</InputLabel>
                <Select
                  value={profile.education}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
                >
                  {educationLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* プライバシー設定 */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            プライバシー設定
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={profile.allowDataCollection}
                onChange={(e) =>
                  handleInputChange("allowDataCollection", e.target.checked)
                }
              />
            }
            label="統計データの収集を許可する"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            アンケートの品質向上のため、匿名化された統計データを収集します
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={profile.allowLocationTracking}
                onChange={(e) =>
                  handleInputChange("allowLocationTracking", e.target.checked)
                }
              />
            }
            label="位置情報の利用を許可する"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            地域別の分析結果を表示するため、位置情報を収集します
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={profile.shareProfileData}
                onChange={(e) =>
                  handleInputChange("shareProfileData", e.target.checked)
                }
              />
            }
            label="プロフィールデータの共有を許可する"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            アンケート作成者にあなたの人口統計情報を共有します
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={loading}
            sx={{ width: "100%" }}
          >
            {loading ? "保存中..." : "プロフィールを保存"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfileForm;
