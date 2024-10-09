import React, { createContext, useContext, useState, useEffect } from 'react';
import Parse from 'parse';

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const APP_ID = import.meta.env.VITE_PARSE_APP_ID;
    const JS_KEY = import.meta.env.VITE_PARSE_JS_KEY;
    
    if (!APP_ID || !JS_KEY) {
      console.error('Parse credentials are not set. Please check your environment variables.');
      return;
    }

    Parse.initialize(APP_ID, JS_KEY);
    Parse.serverURL = 'https://parseapi.back4app.com/';

    const currentUser = Parse.User.current();
    if (currentUser) {
      setUser({ username: currentUser.get('username') });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const user = await Parse.User.logIn(username, password);
      setUser({ username: user.get('username') });
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Parse.User.logOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};