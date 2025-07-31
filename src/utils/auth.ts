// Simplified authentication utilities
// Always returns a default user for development

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Default user for development (using existing UUID)
const DEFAULT_USER: User = {
  id: 'c05c1fa1-bf63-46ff-bde9-2a78c814abdc',
  email: 'higashionna37@icloud.com',
  name: 'higashionna37@icloud.com',
  avatar: undefined
};

// Always return the default user
export const getCurrentUser = async (): Promise<User | null> => {
  return DEFAULT_USER;
};

// Always return true (logged in)
export const isAuthenticated = async (): Promise<boolean> => {
  return true;
};

// Mock login function (always succeeds)
export const login = async (email: string, _password: string): Promise<User> => {
  console.log('Mock login called with:', email);
  return DEFAULT_USER;
};

// Mock logout function
export const logout = async (): Promise<void> => {
  console.log('Mock logout called - but user remains logged in');
};

// Mock signup function (always succeeds)
export const signup = async (email: string, password: string, name?: string): Promise<User> => {
  console.log('Mock signup called with:', email, name);
  return DEFAULT_USER;
};

// Get user ID (always returns default user ID)
export const getUserId = (): string => {
  return DEFAULT_USER.id;
};

// Check if user is logged in (always true)
export const checkAuth = (): boolean => {
  return true;
};