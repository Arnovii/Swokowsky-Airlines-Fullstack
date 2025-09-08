import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/poppins/400.css";
import "@fontsource/oswald/500.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
