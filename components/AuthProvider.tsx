"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAccount,
  logIn,
  logOut,
  signUp,
  type Account,
  type AccountState,
} from "../lib/auth-api";

type Intent = { edition: "free" | "pro"; href: string } | null;

type AuthValue = {
  state: AccountState;
  /** Open the sign in dialog. `intent` is the download to continue to afterwards. */
  requestSignIn: (intent?: Intent) => void;
  closeDialog: () => void;
  dialogOpen: boolean;
  intent: Intent;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccountState>({ status: "loading" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>(null);

  useEffect(() => {
    let active = true;
    void fetchAccount().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const apply = useCallback((account: Account) => {
    setState({ status: "ready", account });
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      state,
      dialogOpen,
      intent,
      requestSignIn: (next: Intent = null) => {
        setIntent(next);
        setDialogOpen(true);
      },
      closeDialog: () => {
        setDialogOpen(false);
        setIntent(null);
      },
      signUp: async (email, password, name) => apply(await signUp(email, password, name)),
      logIn: async (email, password) => apply(await logIn(email, password)),
      logOut: async () => apply(await logOut()),
    }),
    [state, dialogOpen, intent, apply],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

/** Convenience: the signed in user, or null while loading, signed out or offline. */
export function useAccount(): Account | null {
  const { state } = useAuth();
  return state.status === "ready" ? state.account : null;
}
