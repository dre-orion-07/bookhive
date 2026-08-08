import { createBrowserRouter } from "react-router";
import LandingPage from "./landing/LandingPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import DashboardPage from "./dashboard/DashboardPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import ProfilePage from "./profile/ProfilePage";
import SearchPage from "./books/SearchPage";
import BookDetailPage from "./books/BookDetailPage";
import LibraryPage from "./library/LibraryPage";
import BookshelvesPage from "./bookshelves/BookshelvesPage";
import BookshelfDetailPage from "./bookshelves/BookshelfDetailPage";
import DiscoverReadersPage from "./readers/DiscoverReadersPage";
import ClubsPage from "./clubs/ClubsPage";
import ClubDetailPage from "./clubs/ClubDetailPage";
import ConversationList from "./messaging/ConversationList";
import ChatPage from "./messaging/ChatPage";
import NotificationsPage from "../modules/notifications/NotificationsPage";
import AppLayout from "../shared/layouts/AppLayout";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
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
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
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
      {
        path: "/library",
        element: (
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/bookshelves",
        element: (
          <ProtectedRoute>
            <BookshelvesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/bookshelves/:id",
        element: (
          <ProtectedRoute>
            <BookshelfDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/readers",
        element: (
          <ProtectedRoute>
            <DiscoverReadersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/clubs",
        element: (
          <ProtectedRoute>
            <ClubsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/clubs/:id",
        element: (
          <ProtectedRoute>
            <ClubDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/messages",
        element: (
          <ProtectedRoute>
            <ConversationList />
          </ProtectedRoute>
        ),
      },
      {
        path: "/messages/:id",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
