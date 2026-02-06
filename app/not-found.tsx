import Link from 'next/link';
import styles from './page.module.css';

export const dynamic = 'force-dynamic'; // ADD THIS LINE

export default function NotFound() {
  return (
    <div className={styles.container} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <h1 style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '28px', marginBottom: '12px', color: 'var(--text-primary)' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '16px', marginBottom: '32px', color: 'var(--text-secondary)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        style={{ 
          padding: '12px 32px', 
          background: '#4A90E2', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
}