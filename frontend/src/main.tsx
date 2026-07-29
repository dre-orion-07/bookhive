import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./routes/router";
import AuthBootstrap from "./shared/components/AuthBootstrap";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  </StrictMode>
);
