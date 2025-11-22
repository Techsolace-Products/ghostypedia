const TOKEN_KEY = 'ghostypedia_auth_token';
const TOKEN_EXPIRY_KEY = 'ghostypedia_token_expiry';

export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    // Check if token is expired
    if (new Date(expiry) <= new Date()) {
      this.removeToken();
      return null;
    }
    
    return token;
  },

  setToken(token: string, expiresAt: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  hasValidToken(): boolean {
    return this.getToken() !== null;
  }
};
