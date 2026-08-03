import { createBrowserRouter } from "react-router";
import LandingPage from "./landing/LandingPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import DashboardPage from "./dashboard/DashboardPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import ProfilePage from "./profile/ProfilePage";
import SearchPage from "./books/SearchPage";
import BookDetailPage from "./books/BookDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/search",
    element: <SearchPage />,
  },

  {
    path: "/books/:id",
    element: <BookDetailPage />,
  },
]);
