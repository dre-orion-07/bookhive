import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../../modules/auth/services/auth.service";

interface AuthBootstrapProps {
  children: ReactNode;
}

function AuthBootstrap({ children }: AuthBootstrapProps) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    const restoreSession = async () => {
      if (!refreshToken) {
        setIsRestoring(false);
        return;
      }

      try {
        const tokens = await authService.refreshSession(refreshToken);
        useAuthStore.setState({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
        const user = await authService.getCurrentUser();
        setAuth(user, tokens.accessToken, tokens.refreshToken);
      } catch {
        clearAuth();
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [hasHydrated, refreshToken, setAuth, clearAuth]);

  if (!hasHydrated || isRestoring) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-gray-400 font-sans">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthBootstrap;
