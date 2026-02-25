'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { HiEye, HiEyeSlash, HiShieldCheck, HiLockClosed } from 'react-icons/hi2';
import BackToHome from '@/components/common/BackToHome';
import { useSettings } from '@/lib/hooks/useSettings';
import styles from './login.module.css';

function LoginContent() {
  const router = useRouter();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    if (strength <= 25) return { strength, label: 'Weak', color: '#E74C3C' };
    if (strength <= 50) return { strength, label: 'Fair', color: '#F39C12' };
    if (strength <= 75) return { strength, label: 'Good', color: '#3498DB' };
    return { strength, label: 'Strong', color: '#27AE60' };
  };

  const passwordStrength = getPasswordStrength(password);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.replace('/admin');
  }

  return (
    <div className={styles.container}>
      <div className={styles.gradientBg}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
      </div>
      <BackToHome />
      <div className={styles.loginCard}>
        <div className={styles.brandSection}>
          {settings.avatar ? (
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarCircle}>
               <Image 
  src={settings.avatar} 
  alt={settings.name} 
  width={100} 
  height={100} 
  className={styles.avatarImage} 
  style={{ borderRadius: '50%' }}
  priority 
/>
              </div>
            </div>
          ) : (
            <div className={styles.logoIcon}>
              <HiShieldCheck size={32} />
            </div>
          )}
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Sign in to manage your portfolio</p>
        </div>
        {error && (
          <div className={styles.errorBanner}>
            <HiLockClosed size={18} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
              </button>
            </div>
            {password && (
              <div className={styles.strengthIndicator}>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width: `${passwordStrength.strength}%`,
                      background: passwordStrength.color,
                    }}
                  />
                </div>
                <span className={styles.strengthLabel} style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <>
                <span className={styles.spinner} />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <HiShieldCheck size={20} />
                <span>Sign In Securely</span>
              </>
            )}
          </button>
        </form>
        <div className={styles.cardFooter}>
          <p className={styles.footerText}>Protected by enterprise-grade security</p>
        </div>
      </div>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Portfolio Admin. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <span>•</span>
          <Link href="/#contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0A1929 0%, #1A2F42 100%)' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}