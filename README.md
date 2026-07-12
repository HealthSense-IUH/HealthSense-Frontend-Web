# HeathSense Frontend Web

A modern frontend application for **HeathSense**, built with React, TypeScript, and Vite.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Linting & Formatting:** ESLint & Prettier

## 📂 Project Structure

```text
heathsense-frontend-web/
├── public/           # Static assets (images, icons)
├── src/              # Source code
│   ├── constants/    # Global constants and config
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Route components (Pages)
│   ├── router/       # Routing configuration
│   ├── services/     # API services and Axios instances
│   ├── utils/        # Utility/helper functions
│   ├── App.tsx       # Main application component
│   └── main.tsx      # Application entry point
├── eslint.config.js  # ESLint configuration
├── vite.config.ts    # Vite configuration
└── package.json      # Dependencies and scripts
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (or yarn/pnpm)

### Installation

1. Clone the repository and navigate to the project folder.
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to identify code issues.
