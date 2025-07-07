// import { emotionalQuestions, rationalQuestions, passiveQuestions, activeQuestions } from './question_list'
// import { NextApiRequest, NextApiResponse } from 'next';

// export interface Question {
//   id: number;
//   text: string;
//   type: string;
// }

// // 配列をシャッフルする関数
// function shuffle(array: any[]): any[] {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// // ランダムな質問リストを生成する関数
// function generateRandomQuestions(): Question[] {
//   const selectedEmotionalQuestions = shuffle([...emotionalQuestions]).slice(0, 15);
//   const selectedRationalQuestions = shuffle([...rationalQuestions]).slice(0, 15);
//   const selectedActiveQuestions = shuffle([...activeQuestions]).slice(0, 15);
//   const selectedPassiveQuestions = shuffle([...passiveQuestions]).slice(0, 15);

//   return shuffle([
//     ...selectedEmotionalQuestions,
//     ...selectedRationalQuestions,
//     ...selectedActiveQuestions,
//     ...selectedPassiveQuestions,
//   ]);
// }

// // API ハンドラー
// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   const questions = generateRandomQuestions();
//   res.status(200).json(questions);
// }
