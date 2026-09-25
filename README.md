# AarByte

> **AarByte** is a fast, modern, and intuitive online code compiler, interactive playground, and problem-solving platform built for developers, students, and engineers.

Write, run, test, and share code in multiple programming languages directly in the browser with zero setup.

---

## ✨ Features

- **Multi-Language Support**:
  - Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, and PHP.
- **Monaco Code Editor**:
  - Full syntax highlighting, line numbers, bracket matching, code folding, and auto-indentation powered by VS Code's editor engine.
- **Interactive Execution & Console**:
  - Real-time output stream with execution statistics (runtime execution time, memory usage).
  - Custom standard input (STDIN) support for interactive programs.
- **Curated Problem Bank**:
  - Built-in coding problems spanning Easy, Medium, and Hard difficulty levels.
  - Test case verification and status reporting.
- **Playground & Snippet Management**:
  - Quick prototyping environment for testing algorithms and snippets.
  - Local persistence for editor settings and saved programs.
- **Themes & Responsive Design**:
  - Seamless Dark and Light theme switching.
  - Clean, distraction-free modern UI built with Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
AarCode/
├── public/                # Static assets & favicons
├── src/
│   ├── components/        # UI components
│   │   ├── compiler/      # Editor, console, execution controls & share modals
│   │   ├── console/       # Terminal output & execution logs
│   │   ├── editor/        # Monaco editor wrapper & controls
│   │   ├── layout/        # Navbar, footer, and navigation
│   │   └── ui/            # Reusable buttons, badges, modals, tabs
│   ├── config/            # Language configurations, themes & app constants
│   ├── hooks/             # Custom React hooks (theme, storage, compiler)
│   ├── pages/             # Landing, Compiler, Problems, Playground, Docs, Pricing
│   ├── services/          # Execution engine & problem solver services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper utilities
│   ├── App.tsx            # Main application router
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global Tailwind styles
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or later recommended) and `npm` installed.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/aravindh1-stack/AarCode.git
cd AarCode
npm install
```

### Development Server

Start the local development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Production Build

To create an optimized production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### Type Checking & Linting

```bash
npm run typecheck
npm run lint
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
