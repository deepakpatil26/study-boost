# 📚 StudyBuddy AI – AI-Powered Study Assistant

> A full-stack chatbot that turns _“I don’t get it”_ into _“Now I can teach it!”_

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://study-boost-delta.vercel.app/)

## 🖼️ Screenshots

| Chat Interface                                  | Concept Explainer                                               | Quiz Generation                       |
| ----------------------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| ![Chat Interface](/public/screenshots/chat.png) | ![Concept Explainer](/public/screenshots/concept-explainer.png) | ![Quiz](/public/screenshots/quiz.png) |

---

## 🎯 Problem Statement

Students often struggle with:

1. **Instant clarification** outside class hours.
2. **Personalized explanations** that match their grade level and learning style.
3. **Practice questions** aligned to their current topics.
4. **Persistent history** to review past doubts and track progress.

StudyBuddy AI solves this by providing a **responsive, streaming chatbot** that:

- Generates **bite-sized explanations** on any subject.
- Creates **grade-appropriate quizzes** on demand.
- Accepts **PDF / image uploads** and answers questions from them.
- Remembers every conversation across devices.

---

## ✅ Core Features

| Feature                 | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| 🔐 **Auth & Profiles**  | Google OAuth sign-in; user can set grade, subjects, and preferred language. |
| 💬 **Streaming Chat**   | Real-time AI responses using Gemini API (text + images).                    |
| 📄 **Document Q&A**     | Upload PDF / PNG / JPG; ask questions about the content.                    |
| 🧪 **Quiz Generator**   | Auto-create MCQs or flashcards with instant feedback.                       |
| 🔍 **Concept Explorer** | Type any topic → receive concise summary + examples.                        |
| 📜 **Chat History**     | Infinite scroll of past chats, searchable & exportable.                     |
| ⭐ **Save & Share**     | Bookmark explanations or quizzes; generate shareable links.                 |
| 🌙 **Theming**          | Light / dark mode toggle.                                                   |

---

## 🛠 Tech Stack

| Layer          | Choice                                                  |
| -------------- | ------------------------------------------------------- |
| **Frontend**   | Vite + React 18 + TypeScript                            |
| **Styling**    | TailwindCSS + Framer-motion (animations)                |
| **Backend**    | Node.js (Express) **or** Next.js API Routes             |
| **AI Engine**  | Google Gemini API (multimodal)                          |
| **Auth & DB**  | Firebase Authentication + Firestore                     |
| **Storage**    | Firebase Storage (PDF / image uploads)                  |
| **Deployment** | Firebase Hosting (frontend) + Cloud Functions (backend) |
| **Streaming**  | Vercel AI SDK (`useChat`)                               |
| **DevOps**     | GitHub Actions CI → Firebase on merge                   |

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone & install
git clone https://github.com/deepakpatil26/study-boost.git
cd study-boost
npm install          # or npm / yarn

# 2. Configure Firebase
cp client/.env.example client/.env.local
# Add your Firebase & Gemini keys

# 3. Run dev servers
npm run dev              # spins up Vite client + Node server
```

---

## 📦 Environment Variables

```bash
# client/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_GEMINI_API_KEY=xxx

# server/.env
GEMINI_API_KEY=xxx
FIREBASE_SERVICE_ACCOUNT=xxx.json
```

---

## 🧪 Future Enhancements

- Voice Chat via Web Speech API.
- Spaced-repetition flashcards auto-scheduled.
- Gamification (streaks, badges).
- Classroom mode for teachers to create shared quizzes.

---

## 📄 License

MIT © Deepak Patil 2025

---
