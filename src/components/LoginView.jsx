import React, { useState } from 'react';
import { db } from './firebase'; // Importa la base de datos de Firestore
import { doc, getDoc } from 'firebase/firestore';

export default function LoginView({
  theme,
  onToggleTheme,
  onLogin
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanUsername = username.trim().toLowerCase();
      
      if (!cleanUsername || !password) {
        throw new Error('Por favor ingresa tu usuario y contraseña.');
      }

      // Buscamos la iglesia en Firestore usando el nombre de usuario como ID
      const docRef = doc(db, 'churches', cleanUsername);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('El usuario ingresado no existe en la base de datos.');
      }

      const churchData = docSnap.data();

      // Validamos la contraseña
      if (churchData.password !== password) {
        throw new Error('Contraseña incorrecta.');
      }

      // Enviamos los datos de sesión para que la app principal reconozca a la iglesia
      onLogin({
        isAuthenticated: true,
        churchId: churchData.id,
        churchName: churchData.churchName,
        username: churchData.username,
        logo: churchData.logo,
        rememberSession: true
      });

    } catch (err) {
      console.error(err);
      setError(err.message || 'Usuario o contraseña incorrectos. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Iniciar Sesión - Alabanza</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Usuario:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
            placeholder="ej. iglesia_central"
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
            placeholder="••••••••"
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