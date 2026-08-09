import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const container = document.getElementById("root") as HTMLElement | null;
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  // Fallback for environments where the HTML root is missing
  // Log an error to help debugging instead of throwing
  // the React "Target container is not a DOM element" exception.
  // The app will not mount, but the error is visible in logs.
  // eslint-disable-next-line no-console
  console.error('Root element not found: cannot mount React application');
}