'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  HiRectangleGroup, 
  HiCodeBracket, 
  HiEnvelope, 
  HiBriefcase 
} from 'react-icons/hi2';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    messages: 0,
    experience: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [projects, skills, messages, experience] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('experience').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        projects: projects.count || 0,
        skills: skills.count || 0,
        messages: messages.count || 0,
        experience: experience.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { icon: HiRectangleGroup, label: 'Projects', value: stats.projects, color: '#4A90E2' },
    { icon: HiCodeBracket, label: 'Skills', value: stats.skills, color: '#48BB78' },
    { icon: HiEnvelope, label: 'Messages', value: stats.messages, color: '#F6AD55' },
    { icon: HiBriefcase, label: 'Experience', value: stats.experience, color: '#9F7AEA' },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                background: 'rgba(26, 47, 66, 0.6)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(74, 144, 226, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Icon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: 600, color: '#fff', margin: 0 }}>
                  {stat.value}
                </h3>
                <p style={{ fontSize: '14px', color: '#A0AEC0', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ color: '#A0AEC0' }}>
        <p>Welcome to your admin dashboard!</p>
        <p>Use the sidebar to manage your portfolio content.</p>
      </div>
    </div>
  );
}