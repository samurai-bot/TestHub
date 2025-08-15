// Simple API token authentication for TestHub
// In production, you'd want more sophisticated auth

export function generateApiToken(): string {
  // Generate a secure random token
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'th_'; // TestHub prefix
  
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

export function validateApiToken(token: string): boolean {
  // For now, accept any token that starts with 'th_'
  // In production, you'd store tokens in database and validate against them
  const validToken = process.env.TESTHUB_API_TOKEN;
  
  if (!validToken) {
    console.warn('No TESTHUB_API_TOKEN configured');
    return true; // Allow if no token is set (development mode)
  }
  
  return token === validToken;
}

export function extractTokenFromRequest(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check query parameter as fallback
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  
  return tokenParam;
}