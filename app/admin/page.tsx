'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  HiRectangleGroup, 
  HiCodeBracket, 
  HiEnvelope, 
  HiBriefcase,
  HiPlus,
  HiPhoto,
  HiArrowTrendingUp
} from 'react-icons/hi2';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    messages: 0,
    experience: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching data from Supabase...');

      // Fetch projects count
      const { count: projectsCount, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      if (projectsError) {
        console.error('Projects error:', projectsError);
        throw projectsError;
      }

      // Fetch skills count
      const { count: skillsCount, error: skillsError } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true });

      if (skillsError) {
        console.error('Skills error:', skillsError);
        throw skillsError;
      }

      // Fetch messages count
      const { count: messagesCount, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      if (messagesError) {
        console.error('Messages error:', messagesError);
        throw messagesError;
      }

      // Fetch experience count
      const { count: experienceCount, error: experienceError } = await supabase
        .from('experience')
        .select('*', { count: 'exact', head: true });

      if (experienceError) {
        console.error('Experience error:', experienceError);
        throw experienceError;
      }

      console.log('Counts:', {
        projects: projectsCount,
        skills: skillsCount,
        messages: messagesCount,
        experience: experienceCount
      });

      setStats({
        projects: projectsCount || 0,
        skills: skillsCount || 0,
        messages: messagesCount || 0,
        experience: experienceCount || 0,
      });

      // Fetch recent messages
      const { data: messagesData, error: recentMessagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentMessagesError) {
        console.error('Recent messages error:', recentMessagesError);
      } else {
        setRecentMessages(messagesData || []);
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { 
      icon: HiRectangleGroup, 
      label: 'Projects', 
      value: stats.projects, 
      color: '#4A90E2',
      link: '/admin/projects'
    },
    { 
      icon: HiCodeBracket, 
      label: 'Skills', 
      value: stats.skills, 
      color: '#48BB78',
      link: '/admin/skills'
    },
    { 
      icon: HiEnvelope, 
      label: 'Messages', 
      value: stats.messages, 
      color: '#F6AD55',
      link: '/admin/messages'
    },
    { 
      icon: HiBriefcase, 
      label: 'Experience', 
      value: stats.experience, 
      color: '#9F7AEA',
      link: '/admin/experience'
    },
  ];

 const quickActions = [
  { icon: HiRectangleGroup, label: ' + Project', link: '/admin/projects' },
  { icon: HiCodeBracket, label: ' + Skill', link: '/admin/skills' },
  { icon: HiBriefcase, label: ' + Experience', link: '/admin/experience' },
  { icon: HiPhoto, label: ' + Showcase', link: '/admin/showcase' },
  { icon: HiArrowTrendingUp, label: 'View Analytics', link: 'https://analytics.google.com', external: true },
];

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p style={{ color: '#E74C3C', marginBottom: '16px' }}>Error: {error}</p>
        <button 
          onClick={loadData}
          style={{
            background: '#4A90E2',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Debug Info - Remove this later */}
      <div style={{ 
        background: 'rgba(74, 144, 226, 0.1)', 
        padding: '10px', 
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#A0AEC0'
      }}>
        <strong>Debug:</strong> Projects: {stats.projects}, Skills: {stats.skills}, Messages: {stats.messages}, Experience: {stats.experience}
      </div>

      {/* Compact Stats */}
      <div className={styles.statsGrid}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => router.push(stat.link)}
              className={styles.statCard}
            >
              <div className={styles.statIcon} style={{ background: stat.color }}>
                <Icon size={16} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
             <button
  key={action.label}
  onClick={() => {
    if (action.external) {
      window.open(action.link, '_blank');
    } else {
      router.push(action.link);
    }
  }}
  className={styles.actionBtn}
>
  <Icon size={18} />
  <span>{action.label}</span>
</button>
            );
          })}
        </div>
      </div>

      {/* Recent Messages */}
      {recentMessages.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Messages</h2>
            <button 
              onClick={() => router.push('/admin/messages')}
              className={styles.viewAllBtn}
            >
              View All
            </button>
          </div>
          <div className={styles.messagesList}>
            {recentMessages.map((message) => (
              <div key={message.id} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageName}>{message.name}</span>
                  <span className={styles.messageDate}>
                    {new Date(message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className={styles.messageEmail}>{message.email}</p>
                <p className={styles.messagePreview}>
                  {message.message.length > 60 
                    ? `${message.message.substring(0, 60)}...` 
                    : message.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={loadData}
          style={{
            background: 'rgba(74, 144, 226, 0.1)',
            color: '#4A90E2',
            border: '1px solid rgba(74, 144, 226, 0.2)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}