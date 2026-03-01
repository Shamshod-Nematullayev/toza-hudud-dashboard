import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function OAuthSuccess() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');

    if (!token) {
      setStatus('error');
      return;
    }

    // Tokenni saqlaymiz
    Cookies.set('accessToken', token);

    // URL'dan tokenni olib tashlaymiz (security + clean URL)
    window.history.replaceState({}, document.title, '/auth-success');

    setStatus('success');

    // 1.5 sekunddan keyin bosh sahifaga o'tadi
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  }, []);

  return (
    <div style={containerStyle}>
      {status === 'loading' && <p>Authenticating...</p>}
      {status === 'success' && <p>Login successful. Redirecting...</p>}
      {status === 'error' && (
        <>
          <p>Authentication failed.</p>
          <a href="/login">Back to Login</a>
        </>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  fontFamily: 'sans-serif',
  fontSize: '18px'
};
