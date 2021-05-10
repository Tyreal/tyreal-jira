import * as React from "react";
import * as auth from "auth-provider";
import { ReactNode, useState } from "react";
import { User } from "../screens/project-list/search-panel";
import { tFetch } from "../utils/http";
import { useMount } from "../utils";

interface AuthForm {
  username: string;
  password: string;
}

const bootstrapUser = async () => {
  let user = null;
  let token = auth.getToken();
  if (token) {
    let data = await tFetch("me", { token });
    user = data.user;
  }
  return user;
};

const AuthContext = React.createContext<
  | {
      user: User | null;
      login: (form: AuthForm) => Promise<void>;
      register: (form: AuthForm) => Promise<void>;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);
AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (form: AuthForm) =>
    auth.login(form).then((user) => setUser(user));

  const register = (form: AuthForm) =>
    auth.register(form).then((user) => setUser(user));

  const logout = () => auth.logout().then(() => setUser(null));

  useMount(() => {
    bootstrapUser().then(setUser);
  });

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout }}
      children={children}
    />
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth必须要在AuthProvider中使用");
  }
  return context;
};
