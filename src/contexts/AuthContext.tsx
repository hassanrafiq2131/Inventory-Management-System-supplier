import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { app } from "../config/firebase";
import { authApi } from "../services/api";

interface User extends FirebaseUser {
  accessToken: string;
  mongoId?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  const syncUserWithMongoDB = async (user: FirebaseUser) => {
    try {
      const response = await authApi.sync();
      return response.data;
    } catch (error) {
      console.error("Error syncing user with MongoDB:", error);
    }
  };

  async function register(email: string, password: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await syncUserWithMongoDB(userCredential.user);
  }

  async function login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const accessToken = await user.getIdToken();
    const mongoUser = await syncUserWithMongoDB(user);
    setCurrentUser({ ...user, accessToken, mongoId: mongoUser?._id });
  }

  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const accessToken = await user.getIdToken();
        const mongoUser = await syncUserWithMongoDB(user);
        setCurrentUser({ ...user, accessToken, mongoId: mongoUser?._id });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
