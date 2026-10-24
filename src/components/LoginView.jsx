import React from 'react';
import AuthView from './AuthView';

/**
 * LoginView (Backwards-compatible export wrapping AuthView)
 */
export default function LoginView({
  churchSettings,
  theme,
  onToggleTheme,
  onLogin
}) {
  return (
    <AuthView
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLoginSuccess={(session, church) => {
        onLogin({
          ...session,
          churchId: church.id,
          churchName: church.name,
          email: session.adminEmail || session.email,
          userName: church.name,
          rememberSession: true
        });
      }}
    />
  );
}
