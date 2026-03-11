import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDeepLinkHandler } from "./lib/deepLinkHandler";

// Initialize deep link handler for Capacitor native apps
if (typeof (window as any).Capacitor !== 'undefined') {
  initDeepLinkHandler();
}

createRoot(document.getElementById("root")!).render(<App />);
