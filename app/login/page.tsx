'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A1929'
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#1A2F42',
        padding: '40px',
        borderRadius: '12px',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h1 style={{ color: '#fff', marginBottom: '24px', textAlign: 'center' }}>
          Admin Login
        </h1>
        
        {error && (
          <div style={{
            background: '#E74C3C',
            color: '#fff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '6px',
            border: '1px solid rgba(74, 144, 226, 0.2)',
            background: 'rgba(26, 47, 66, 0.6)',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '1px solid rgba(74, 144, 226, 0.2)',
            background: 'rgba(26, 47, 66, 0.6)',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#4A90E2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}