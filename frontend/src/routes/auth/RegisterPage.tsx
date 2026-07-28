import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "../../modules/auth/schemas/auth.schema";
import { authService } from "../../modules/auth/services/auth.service";
import { useAuthStore } from "../../shared/stores/authStore";

function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await authService.register(values);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data
              ?.error?.message
          : null;
      setServerError(message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--color-background) flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-(--color-surface) border border-(--color-border) rounded-2xl p-8">
        <h1 className="text-2xl font-sans font-semibold text-white mb-1">Create Account</h1>
        <p className="text-sm text-gray-400 mb-6">Join thousands of readers on BookHive</p>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="displayName"
              type="text"
              {...register("displayName")}
              className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white font-medium py-2.5 transition"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-(--color-primary) hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
