// src/utils/auth.ts - Final version
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('token');
};

// Alias for backward compatibility (remove after updating all references)
export const removeToken = clearToken;

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
