import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, loginRequest, registerRequest } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [profileMeta, setProfileMeta] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  async function fetchProfile() {
    try {
      setLoading(true);
      const data = await getMe();
      setUser(data.user);
      setProfileMeta({
        linkedUniversity: data.linkedUniversity,
        accessType: data.accessType,
        company: data.company,
        studentProfile: data.studentProfile,
      });
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function login(email, password) {
    const data = await loginRequest({ email, password });

    localStorage.setItem('token', data.token);
    setToken(data.token);

    const profileRes = await getMe();
    setUser(profileRes.user);
    setProfileMeta({
      linkedUniversity: profileRes.linkedUniversity,
      accessType: profileRes.accessType,
      company: profileRes.company,
      studentProfile: profileRes.studentProfile,
    });

    return data;
  }

  async function register(payload) {
    const data = await registerRequest(payload);

    localStorage.setItem('token', data.token);
    setToken(data.token);

    const profileRes = await getMe();
    setUser(profileRes.user);
    setProfileMeta({
      linkedUniversity: profileRes.linkedUniversity,
      accessType: profileRes.accessType,
      company: profileRes.company,
      studentProfile: profileRes.studentProfile,
    });

    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfileMeta(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      profileMeta,
      loading,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
    }),
    [token, user, profileMeta, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
