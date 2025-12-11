import { Store } from "@tanstack/store";

type AuthState = {
  token: string | null;
  user: { name: string; email: string } | null | any;
};

function loadAuthState(): AuthState {
  try {
    if (typeof window == "undefined") return { token: null, user: null };
    const savedState = localStorage.getItem("authState");
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (error) {}
    }
    return { token: null, user: null };
  } catch (error) {
    return { token: null, user: null };
  }
}

const initialState: AuthState = loadAuthState();

export const authStore = new Store<AuthState>(initialState);

export const updateAuthStore = (updates: Partial<AuthState>) => {
  authStore.setState((state) => ({
    ...state,
    ...updates,
  }));
  if (typeof window == "undefined") return;
  localStorage.setItem("authState", JSON.stringify(authStore.state));
};

export const getAuthState = (): AuthState => {
  return authStore.state;
};
