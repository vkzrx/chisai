import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./main.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root not defined");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
