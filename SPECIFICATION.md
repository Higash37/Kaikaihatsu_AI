# Project Specification: Questionnaire Platform (Updated Version)

## 1. Project Overview

This project is a web-based platform that allows users to create, share, and take arbitrary questionnaires. Users can design their own questions, define answer types, and collect responses. The platform aims to provide a flexible tool for various survey and quiz needs.

## 2. Technology Stack

- **Framework**: Next.js 13.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS, MUI (Material-UI)
- **Animation**: Framer Motion
- **Chart**: Chart.js, react-chartjs-2 (for potential response visualization)
- **Backend**: Next.js API Routes, Express.js (in `server.mjs`)
- **Database**: PostgreSQL (based on `pg` dependency)
- **PWA**: next-pwa for Progressive Web App capabilities.
- **Authentication**: NextAuth.js
- **Linting/Formatting**: ESLint, Prettier

## 3. Design Principles

This application adopts an "iPhone-like, ultra-modern and stylish" design, emphasizing minimalism, clean aesthetics, and intuitive user experience. Key design elements include:

- **Overall Tone & Manner**: Minimalist and clean, with ample whitespace and reduced visual noise. Focus on a sophisticated and high-quality impression through refined details.
- **Color Palette**: Primarily based on iOS system colors, with a blue-centric theme (`#007AFF` as primary). Neutral colors (white, light gray, dark gray, black) are used for backgrounds and text, with accent colors for interactive elements.
- **Typography**: Utilizes "Zen Maru Gothic" for Japanese text and a modern sans-serif font stack (similar to SF Pro Display) for English. Emphasis on clear visual hierarchy through font size, weight, and color.
- **Components**: Features minimalist buttons, clean input fields, and rounded-corner cards/containers. Interactions are enhanced with subtle shadows and smooth animations.
- **Animations (Framer Motion)**: Extensive use of Framer Motion for fluid screen transitions, subtle element appearances (fade-in, scale-up), and responsive feedback on user interactions (e.g., button taps, heart selections).

## 4. Application Flow

1. **Top Page (`/`)**:

   - Displays a central text input area (similar to ChatGPT) for users to enter a questionnaire theme.
   - A button to "Generate Questionnaire" (アンケートを生成する) is prominently displayed, always with a blue background.
   - Users can log in/register from here.

2. **Authentication Flow (`/auth/*`)**:

   - **Registration**: Users can create a new account.
   - **Login**: Existing users can log in.
   - **Session Management**: NextAuth.js handles user sessions.

3. **User Info Page (`/user-info`)**:

   - Users input their gender and age. The gender selection uses refined `CircleBox` components with theme-based colors and enhanced animations.
   - After submission, the user is redirected to the questionnaire page.

4. **Questionnaire Taking Flow (`/quiz`)**:

   - Questions are presented in pages. The UI includes a fixed header with a progress bar, styled according to the new theme.
   - Users answer questions using a 5-point scale, represented by `QuizHeart` components with updated colors and smooth animations.
   - Navigation buttons ("Previous Page", "Next Page", "Complete Questionnaire") are styled with theme colors and rounded corners.

5. **Questionnaire Result Flow (`/result`)**:

   - Displays the questionnaire results, including a summary and detailed profile, using theme-styled `Paper` components, `Typography`, and `LinearProgress` bars.
   - Text content has been updated to be more generic (e.g., "アンケート結果" instead of "診断結果").

## 5. Data Structures

- **User**:

  - `id`: Unique user ID
  - `email`: User's email (for authentication)
  - `name`: User's display name

- **Questionnaire**:

  - `id`: Unique questionnaire ID
  - `title`: Title of the questionnaire
  - `description`: Description of the questionnaire
  - `creatorId`: ID of the user who created the questionnaire
  - `createdAt`: Timestamp of creation
  - `updatedAt`: Timestamp of last update
  - `isPublic`: Boolean indicating if it's publicly accessible

- **Question**:

  - `id`: Unique question ID
  - `questionnaireId`: ID of the parent questionnaire
  - `text`: The question text
  - `type`: Type of question (e.g., 'multiple_choice', 'text_input', 'scale')
  - `options`: Array of strings for multiple choice/scale options (JSONB in DB)
  - `order`: Order of the question within the questionnaire

- **Response**:
  - `id`: Unique response ID
  - `questionnaireId`: ID of the questionnaire being responded to
  - `userId`: ID of the user who responded (nullable, if unauthenticated responses are allowed)
  - `createdAt`: Timestamp of response
  - `answers`: JSONB object mapping `questionId` to `answerValue`

## 6. Backend and Authentication

- **API Routes**:

  - `/api/auth/[...nextauth].ts`: Handles user authentication (login, register, session management).
  - `/api/questionnaires`:
    - `GET /api/questionnaires`: Get all public questionnaires or user's questionnaires.
    - `POST /api/questionnaires`: Create a new questionnaire.
  - `/api/questionnaires/[id]`:
    - `GET /api/questionnaires/[id]`: Get a specific questionnaire and its questions.
    - `PUT /api/questionnaires/[id]`: Update a questionnaire (title, description, questions).
    - `DELETE /api/questionnaires/[id]`: Delete a questionnaire.
  - `/api/questionnaires/[id]/responses`:
    - `POST /api/questionnaires/[id]/responses`: Submit responses for a questionnaire.
    - `GET /api/questionnaires/[id]/responses`: Get all responses for a specific questionnaire (creator only).

- **Custom Server (`server.mjs`)**:
