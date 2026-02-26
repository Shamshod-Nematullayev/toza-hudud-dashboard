import React from 'react';
import { SERVER_DOMAIN } from 'store/constant';

const GOOGLE_LOGIN_URL = SERVER_DOMAIN + '/api/auth/google';

export const GoogleLoginButton = () => {
  const handleLogin = () => {
    // Foydalanuvchini backenddagi /google endpointga yo'naltiramiz
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: '10px 20px',
        backgroundColor: '#4285F4',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      Login with Google
    </button>
  );
};
