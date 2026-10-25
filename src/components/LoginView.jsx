import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Importa la autenticación de Firebase que creamos

export default function LoginView({
  theme,
  onToggleTheme,
  onLogin
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Inicia sesión real en la nube de Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Envía los datos de sesión para que la app principal los reconozca
      onLogin({
        isAuthenticated: true,
        churchId: 'iglesia_principal', // O el ID que prefieras usar en Firestore
        churchName: 'Ministerio de Alabanza',
        email: user.email,
        userName: user.email,
        rememberSession: true
      });

    } catch (err) {
      console.error(err);
      setError('Correo o contraseña incorrectos. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Iniciar Sesión - Alabanza</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleFirebaseLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Correo de la Iglesia:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Entrando...' : 'Entrar a la App'}
        </button>
      </form>
    </div>
  );
}