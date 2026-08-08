import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../shared/stores/authStore";
import { usersService } from "../../modules/users/services/users.service";
import { notificationsService } from "../../modules/notifications/notifications.service";

type Tab = "account" | "privacy" | "notifications" | "reading";

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-(--color-primary)/15 text-(--color-primary)"
          : "text-gray-400 hover:bg-(--color-surface) hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-(--color-border) bg-(--color-background) px-5 py-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function AccountTab() {
  const currentUser = useAuthStore((state) => state.user);
  return (
    <div className="space-y-4">
      <SectionHeader title="Account" description="Manage your account credentials and identity." />
      <SettingRow label="Email address" description={currentUser?.email}>
        <span className="rounded-full bg-(--color-surface) px-3 py-1 text-xs text-gray-400">
          Verified
        </span>
      </SettingRow>
      <SettingRow label="Username" description={`@${currentUser?.username ?? ""}`}>
        <a href="/profile" className="text-xs text-(--color-primary) hover:underline">
          Change →
        </a>
      </SettingRow>
      <SettingRow label="Password" description="Managed via your login method">
        <span className="text-xs text-gray-500">—</span>
      </SettingRow>
    </div>
  );
}

function PrivacyTab() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: () => usersService.getById(currentUser!.id),
    enabled: Boolean(currentUser?.id),
  });

  const updateMutation = useMutation({
    mutationFn: (isPrivateProfile: boolean) => usersService.updateProfile({ isPrivateProfile }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", currentUser?.id], updated);
    },
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Privacy"
        description="Control who can see your reading activity and profile."
      />
      <SettingRow
        label="Private profile"
        description="When enabled, only your followers can see your library and activity."
      >
        <button
          type="button"
          role="switch"
          aria-checked={profile?.isPrivateProfile ?? false}
          onClick={() => updateMutation.mutate(!(profile?.isPrivateProfile ?? false))}
          disabled={updateMutation.isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
            profile?.isPrivateProfile ? "bg-(--color-primary)" : "bg-(--color-border)"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
              profile?.isPrivateProfile ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </SettingRow>
    </div>
  );
}

function NotificationsTab() {
  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsService.getUnreadCount,
  });
  const queryClient = useQueryClient();

  const markAllMutation = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Notifications"
        description="Control your in-app notification experience."
      />
      <SettingRow
        label="Unread notifications"
        description={`You have ${unreadCount ?? 0} unread notifications.`}
      >
        <button
          type="button"
          onClick={() => markAllMutation.mutate()}
          disabled={!unreadCount || unreadCount === 0 || markAllMutation.isPending}
          className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-white transition hover:border-(--color-primary) disabled:cursor-not-allowed disabled:opacity-40"
        >
          {markAllMutation.isPending ? "Clearing…" : "Mark all read"}
        </button>
      </SettingRow>
      <SettingRow
        label="Email notifications"
        description="Coming soon — we'll let you know when this is available."
      >
        <span className="rounded-full border border-(--color-border) px-3 py-1 text-xs text-gray-500">
          Soon
        </span>
      </SettingRow>
    </div>
  );
}

function ReadingPrefsTab() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: () => usersService.getById(currentUser!.id),
    enabled: Boolean(currentUser?.id),
  });

  const updateMutation = useMutation({
    mutationFn: (readingGoal: number) => usersService.updateProfile({ readingGoal }),
    onSuccess: (updated) => queryClient.setQueryData(["profile", currentUser?.id], updated),
  });

  const [goalInput, setGoalInput] = useState("");

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Reading preferences"
        description="Personalise your reading experience and annual goal."
      />
      <SettingRow
        label="Reading goal"
        description={
          profile?.readingGoal
            ? `Currently set to ${profile.readingGoal} books per year`
            : "No reading goal set"
        }
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={1000}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder={String(profile?.readingGoal ?? "")}
            className="w-20 rounded-lg border border-(--color-border) bg-(--color-background) px-3 py-1.5 text-sm text-white focus:border-(--color-primary) focus:outline-none"
          />
          <button
            type="button"
            disabled={!goalInput || updateMutation.isPending}
            onClick={() => {
              const v = parseInt(goalInput, 10);
              if (!isNaN(v) && v > 0) {
                updateMutation.mutate(v);
                setGoalInput("");
              }
            }}
            className="rounded-lg bg-(--color-primary) px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {updateMutation.isPending ? "…" : "Save"}
          </button>
        </div>
      </SettingRow>
      <SettingRow
        label="Favourite genres"
        description={
          profile?.favouriteGenres.length
            ? profile.favouriteGenres.slice(0, 3).join(", ") +
              (profile.favouriteGenres.length > 3 ? " …" : "")
            : "No genres set"
        }
      >
        <a href="/profile" className="text-xs text-(--color-primary) hover:underline">
          Edit →
        </a>
      </SettingRow>
    </div>
  );
}

function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
      <h3 className="mb-4 text-sm font-semibold text-red-400">Danger zone</h3>
      <div className="space-y-3">
        <SettingRow label="Sign out" description="Sign out from all devices on this browser.">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-white transition hover:border-red-500/50 hover:text-red-400"
          >
            Sign out
          </button>
        </SettingRow>
        <SettingRow
          label="Delete account"
          description="Permanently delete your account and all data."
        >
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
            >
              Delete account
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
              >
                Confirm delete
              </button>
            </div>
          )}
        </SettingRow>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "privacy", label: "Privacy" },
  { id: "notifications", label: "Notifications" },
  { id: "reading", label: "Reading preferences" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-(--color-primary)">My account</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Settings</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <nav aria-label="Settings sections" className="lg:col-span-1">
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 space-y-1">
              {TABS.map((tab) => (
                <TabButton
                  key={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </nav>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-3 space-y-4"
          >
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
              {activeTab === "account" && <AccountTab />}
              {activeTab === "privacy" && <PrivacyTab />}
              {activeTab === "notifications" && <NotificationsTab />}
              {activeTab === "reading" && <ReadingPrefsTab />}
            </div>

            {activeTab === "account" && <DangerZone />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
