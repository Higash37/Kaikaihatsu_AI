# Project Specification: LoveNavi (Current Version)

## 1. Project Overview

This project is a web-based "Love Style Diagnosis" application. Users answer a series of questions, and based on their responses, their personality is diagnosed as one of 16 animal types. The results include a detailed description of their love style, compatibility with other types, and a scatter plot visualizing their position and the distribution of other users.

## 2. Technology Stack

*   **Framework**: Next.js 13.4
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, MUI (Material-UI)
*   **Animation**: Framer Motion
*   **Chart**: Chart.js, react-chartjs-2
*   **Backend**: Next.js API Routes, Express.js (in `server.mjs`)
*   **Database**: PostgreSQL (based on `pg` dependency)
*   **PWA**: next-pwa for Progressive Web App capabilities.
*   **Linting/Formatting**: ESLint, Prettier

## 3. Application Flow

1.  **Top Page (`/`)**:
    *   Displays a welcome title and a "Start" button.
    *   Clicking "Start" navigates the user to the user information input page (`/user-info`).

2.  **User Info Page (`/user-info`)**:
    *   The user inputs their gender and age. This information is used for filtering results later.
    *   After submitting, the user is redirected to the quiz page.

3.  **Quiz Page (`/quiz`)**:
    *   A total of 120 questions are presented, divided into 4 categories (emotion, rational, passive, active), with 30 questions each.
    *   Questions are displayed in pages of 10.
    *   For each question, the user chooses their level of agreement on a 5-point scale.
    *   The user's answers are used to calculate four scores: `emotion`, `rational`, `passive`, and `active`.
    *   These scores are weighted and then used to calculate final `x` (`emotion` - `rational`) and `y` (`active` - `passive`) coordinates.
    *   The final scores are saved to `localStorage`.
    *   Upon completion, the user is redirected to the results page.

4.  **Result Page (`/result`)**:
    *   Retrieves the user's scores from `localStorage`.
    *   Determines the user's animal type based on their `x` and `y` coordinates, which fall into one of 16 groups on a 2D plane.
    *   Displays the user's diagnosed animal type, title, image, and detailed descriptions of their characteristics.
    *   Shows a scatter plot visualizing the user's position relative to other users.
    *   Provides filters to view the distribution of other users by gender and age.
    *   Includes a gauge chart showing the user's similarity to other animal types.

## 4. Data Structures

*   **Questions (`src/data/QuestionList.ts`)**:
    *   An array of `Question` objects.
    *   Each `Question` has an `id`, `text` (the question itself), and a `type` (`emotion`, `rational`, `passive`, `active`).

*   **Diagnosis Results (`localStorage`)**:
    *   The user's calculated scores (`emotion`, `rational`, `passive`, `active`, `x`, `y`) are stored in `localStorage` under the key `userScores`.

*   **Animal Groups (`src/data/GroupDescription.ts`)**:
    *   Contains detailed information for each of the 16 animal types, including:
        *   `animalName`
        *   `title`
        *   `imageUrl`
        *   `features` (list of love characteristics)
        *   `descriptionShort`
        *   `descriptionLong`

## 5. Backend and Authentication

*   **API Routes**:
    *   `/api/questions`: Fetches the list of diagnosis questions.
    *   `/api/get-diagnosis`: Fetches diagnosis results of other users for the scatter plot.
    *   `/api/save-diagnosis`: Saves the current user's diagnosis result to the database.
    *   `/api/auth/[...nextauth].ts`: A basic NextAuth.js setup exists but appears to be a placeholder with a simple credentials provider. It is not fully integrated into the application flow yet.

*   **Custom Server (`server.mjs`)**:
    *   An Express server is defined, which seems to handle the API requests and might be used for custom routing or middleware.
