import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../stores/authStore";
import NotificationDropdown from "../../modules/notifications/NotificationDropdown";

const AUTH_PATHS = new Set(["/login", "/register"]);

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/search", label: "Search" },
  { to: "/library", label: "Library" },
  { to: "/clubs", label: "Clubs" },
  { to: "/readers", label: "Readers" },
  { to: "/messages", label: "Messages" },
  { to: "/profile", label: "Profile" },
];

export default function AppLayout() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);

  const showChrome = Boolean(accessToken) && !AUTH_PATHS.has(location.pathname);

  return (
    <div className="min-h-screen bg-(--color-background) text-white">
      {showChrome && (
        <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-background)/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link to="/dashboard" className="group flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--color-primary) text-sm font-semibold text-white shadow-lg shadow-(--color-primary)/25 transition group-hover:scale-105">
                BH
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-none text-white">BookHive</p>
                <p className="mt-1 text-xs text-gray-400">Read, discuss, and connect</p>
              </div>
            </Link>

            <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-(--color-primary)/15 text-(--color-primary)"
                        : "text-gray-400 hover:bg-(--color-surface) hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
            </div>
          </div>
        </header>
      )}

      <main className={showChrome ? "pt-0" : ""}>
        <Outlet />
      </main>
    </div>
  );
}
