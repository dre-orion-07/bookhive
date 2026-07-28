import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { loginFormSchema, type LoginFormValues } from "../../modules/auth/schemas/auth.schema";
import { authService } from "../../modules/auth/services/auth.service";
import { useAuthStore } from "../../shared/stores/authStore";
import { useCallback } from "react";
import { useGoogleSignIn } from "../../shared/hooks/useGoogleSignIn";

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await authService.login(values);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/dashboard");
    } catch {
      setServerError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleToken = useCallback(
    async (idToken: string) => {
      setServerError(null);
      try {
        const result = await authService.googleAuth(idToken);
        setAuth(result.user, result.accessToken, result.refreshToken);
        navigate("/dashboard");
      } catch {
        setServerError("Google sign-in failed. Please try again.");
      }
    },
    [navigate, setAuth]
  );

  useGoogleSignIn("google-signin-btn", handleGoogleToken);

  return (
    <div className="min-h-screen bg-(--color-background) flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-(--color-surface) border border-(--color-border) rounded-2xl p-8">
        <h1 className="text-2xl font-sans font-semibold text-white mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to continue your reading journey</p>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white font-medium py-2.5 transition"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-(--color-border)" />
          <span className="text-xs text-gray-500">or continue with</span>
          <div className="flex-1 h-px bg-(--color-border)" />
        </div>

        <div id="google-signin-btn" className="flex justify-center" />

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-(--color-primary) hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
