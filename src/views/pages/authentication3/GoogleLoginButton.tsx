import { Button } from '@mui/material';
import React from 'react';
import { SERVER_DOMAIN } from 'store/constant';

const GOOGLE_LOGIN_URL = `${SERVER_DOMAIN}/api/auth/google`;
import { useTheme } from '@mui/material/styles';

export const GoogleLoginButton = () => {
  const theme = useTheme();

  const handleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <Button
      onClick={handleLogin}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '10px 24px',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: '1px solid #dadce0',
        borderRadius: '24px', // Yumaloqroq shakl
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'background-color 0.2s, box-shadow 0.2s',
        width: '100%',
        mt: 2
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#f8f9fa';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        e.currentTarget.style.color = '#4285F4';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = theme.palette.background.paper;
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        e.currentTarget.style.color = theme.palette.text.primary;
      }}
    >
      {/* Google Logotipi (SVG) */}
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path
          d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.89 2.69-6.62z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.85-3.05.85-2.34 0-4.32-1.58-5.03-3.71H1.04v2.33C2.52 15.96 5.54 18 9 18z"
          fill="#34A853"
        />
        <path d="M3.97 10.9c-.18-.54-.28-1.12-.28-1.9s.1-1.36.28-1.9V4.77H1.04a8.97 8.97 0 0 0 0 8.46L3.97 10.9z" fill="#FBBC05" />
        <path
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.54 0 2.52 2.04 1.04 5.07l2.93 2.27c.71-2.13 2.69-3.76 5.03-3.76z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </Button>
  );
};
