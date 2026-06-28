const STORAGE_KEY = 'njobs_remembered_credentials';

export const saveRememberedCredentials = (email, password) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
};

export const clearRememberedCredentials = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getRememberedCredentials = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
