import { useEffect, useRef } from "react";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: { theme: string; size: string; width: number }
  ) => void;
}

declare global {
  interface Window {
    google:
      | {
          accounts: {
            id: GoogleAccountsId;
          };
        }
      | undefined;
  }
}

const GOOGLE_CLIENT_ID = "84800255115-l1qg7m7c397gu9fi5l5fkr6vsqsd0rv7.apps.googleusercontent.com";

export function useGoogleSignIn(buttonId: string, onToken: (idToken: string) => void) {
  const initialized = useRef(false);

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) {
        setTimeout(initializeGoogle, 100);
        return;
      }

      if (initialized.current) return;
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          onToken(response.credential);
        },
      });

      const el = document.getElementById(buttonId);
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
          width: 350,
        });
      }
    };

    initializeGoogle();
  }, [buttonId, onToken]);
}
