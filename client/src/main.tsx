import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// No need to wrap with providers here as they're already in App.tsx
// This removes duplicate providers

createRoot(document.getElementById("root")!).render(
  <App />
);
