import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { usersService } from "../../modules/users/services/users.service";
import { useAuthStore } from "../../shared/stores/authStore";

const GENRE_OPTIONS = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical Fiction",
  "Literary Fiction",
  "Horror",
  "Biography",
  "Self-Help",
  "Non-Fiction",
  "True Crime",
  "Poetry",
  "Graphic Novel",
  "Young Adult",
  "Children's",
  "Philosophy",
  "Psychology",
  "Science",
  "History",
];

const READING_GOAL_OPTIONS = [6, 12, 24, 36, 52];

const STEP_COUNT = 3;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [authorsInput, setAuthorsInput] = useState("");
  const [readingGoal, setReadingGoal] = useState<number | null>(null);
  const [genreError, setGenreError] = useState("");

  const saveMutation = useMutation({
    mutationFn: () =>
      usersService.updateProfile({
        favouriteGenres: selectedGenres,
        favouriteAuthors: authorsInput
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        readingGoal: readingGoal ?? undefined,
      }),
    onSuccess: () => navigate("/dashboard"),
  });

  function goNext() {
    if (step === 0 && selectedGenres.length === 0) {
      setGenreError("Please pick at least one genre to continue.");
      return;
    }
    setGenreError("");
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function toggleGenre(genre: string) {
    setGenreError("");
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  const firstName = user?.displayName?.split(" ")[0] ?? "reader";

  return (
    <div className="min-h-screen bg-(--color-background) flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-(--color-primary)" : "bg-(--color-border)"
              }`}
            />
          ))}
        </div>

        <div className="overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            {step === 0 && (
              <motion.div
                key="step-genres"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-(--color-primary) mb-2">
                  Step 1 of {STEP_COUNT}
                </p>
                <h1 className="text-3xl font-semibold text-white mb-2">Welcome, {firstName}!</h1>
                <p className="text-gray-400 mb-6">
                  Pick your favourite genres so we can personalise your recommendations.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        selectedGenres.includes(genre)
                          ? "border-(--color-primary) bg-(--color-primary)/15 text-(--color-primary)"
                          : "border-(--color-border) text-gray-400 hover:border-(--color-primary)/50 hover:text-white"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {genreError && <p className="mb-3 text-sm text-red-400">{genreError}</p>}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-authors"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-(--color-primary) mb-2">
                  Step 2 of {STEP_COUNT}
                </p>
                <h1 className="text-3xl font-semibold text-white mb-2">Favourite authors</h1>
                <p className="text-gray-400 mb-6">
                  Add authors you love — separated by commas. We'll use them to find great
                  recommendations. You can skip this.
                </p>
                <textarea
                  value={authorsInput}
                  onChange={(e) => setAuthorsInput(e.target.value)}
                  rows={3}
                  placeholder="e.g. Brandon Sanderson, Agatha Christie, Stephen King"
                  className="w-full rounded-xl bg-(--color-surface) border border-(--color-border) px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-(--color-primary) resize-none"
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-goal"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-(--color-primary) mb-2">
                  Step 3 of {STEP_COUNT}
                </p>
                <h1 className="text-3xl font-semibold text-white mb-2">Set a reading goal</h1>
                <p className="text-gray-400 mb-6">
                  How many books do you want to read this year? You can change this anytime.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {READING_GOAL_OPTIONS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setReadingGoal(goal)}
                      className={`rounded-xl border py-4 text-center transition ${
                        readingGoal === goal
                          ? "border-(--color-primary) bg-(--color-primary)/15 text-white"
                          : "border-(--color-border) text-gray-400 hover:border-(--color-primary)/50 hover:text-white"
                      }`}
                    >
                      <span className="block text-2xl font-semibold text-white">{goal}</span>
                      <span className="text-xs text-gray-500">books</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReadingGoal(null)}
                    className={`rounded-xl border py-4 text-center transition ${
                      readingGoal === null
                        ? "border-(--color-primary) bg-(--color-primary)/15 text-white"
                        : "border-(--color-border) text-gray-400 hover:border-(--color-primary)/50 hover:text-white"
                    }`}
                  >
                    <span className="block text-lg font-semibold text-white">Skip</span>
                    <span className="text-xs text-gray-500">no goal</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-(--color-primary)/50 hover:text-white"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-300 transition"
            >
              Skip for now
            </button>
          )}

          {step < STEP_COUNT - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-(--color-primary) px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="rounded-lg bg-(--color-primary) px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving..." : "Finish setup"}
            </button>
          )}
        </div>

        {saveMutation.isError && (
          <p className="mt-3 text-center text-sm text-red-400">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
