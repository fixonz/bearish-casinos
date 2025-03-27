import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalletProvider } from "./context/WalletContext";
import { GamesProvider } from "./context/GamesContext";

createRoot(document.getElementById("root")!).render(
  <WalletProvider>
    <GamesProvider>
      <App />
    </GamesProvider>
  </WalletProvider>
);
