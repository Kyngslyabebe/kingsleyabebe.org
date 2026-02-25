'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/components/admin/Toast';
import {
  HiUsers,
  HiTrash,
  HiMagnifyingGlass,
  HiEnvelope,
  HiCheckCircle,
  HiXCircle,
  HiCalendar,
  HiArrowPath
} from 'react-icons/hi2';
import styles from './subscribers.module.css';

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
  unsubscribe_token: string;
}

export default function SubscribersPage() {
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filtered, setFiltered] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  useEffect(() => {
    let result = [...subscribers];
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }
    if (searchQuery) {
      result = result.filter(s => s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFiltered(result);
  }, [subscribers, filterStatus, searchQuery]);

  async function loadSubscribers() {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('blog_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to load subscribers', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      showToast('Click delete again to confirm', 'warning');
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('blog_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Subscriber removed', 'success');
      setSubscribers(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to delete subscriber', 'error');
    }
  }

  async function handleToggleStatus(subscriber: Subscriber) {
    const newStatus = subscriber.status === 'active' ? 'unsubscribed' : 'active';
    try {
      const { error } = await supabaseAdmin
        .from('blog_subscribers')
        .update({ status: newStatus })
        .eq('id', subscriber.id);

      if (error) throw error;
      showToast(`Subscriber ${newStatus === 'active' ? 'reactivated' : 'unsubscribed'}`, 'success');
      setSubscribers(prev => prev.map(s => s.id === subscriber.id ? { ...s, status: newStatus } : s));
    } catch (error: any) {
      showToast(error.message || 'Failed to update subscriber', 'error');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Subscribers</h1>
          <p className={styles.subtitle}>
            {subscribers.length} total · {activeCount} active · {unsubscribedCount} unsubscribed
          </p>
        </div>
        <button onClick={loadSubscribers} className={styles.refreshBtn}>
          <HiArrowPath size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard} style={{ '--stat-color': '#48BB78' } as React.CSSProperties}>
          <div className={styles.statIcon}><HiUsers size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{activeCount}</span>
            <span className={styles.statLabel}>Active Subscribers</span>
          </div>
        </div>
        <div className={styles.statCard} style={{ '--stat-color': '#4A90E2' } as React.CSSProperties}>
          <div className={styles.statIcon}><HiEnvelope size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{subscribers.length}</span>
            <span className={styles.statLabel}>Total Signups</span>
          </div>
        </div>
        <div className={styles.statCard} style={{ '--stat-color': '#A0AEC0' } as React.CSSProperties}>
          <div className={styles.statIcon}><HiXCircle size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{unsubscribedCount}</span>
            <span className={styles.statLabel}>Unsubscribed</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <HiMagnifyingGlass size={18} />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterButtons}>
          {(['all', 'active', 'unsubscribed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`${styles.filterBtn} ${filterStatus === f ? styles.active : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${subscribers.length})`}
              {f === 'active' && ` (${activeCount})`}
              {f === 'unsubscribed' && ` (${unsubscribedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <HiUsers size={48} />
          <p>{subscribers.length === 0 ? 'No subscribers yet. Share your blog to get your first subscriber!' : 'No subscribers match your search.'}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(sub => (
            <div key={sub.id} className={`${styles.row} ${sub.status === 'unsubscribed' ? styles.inactive : ''}`}>
              <div className={styles.rowMain}>
                <div className={styles.avatar}>
                  {sub.email.charAt(0).toUpperCase()}
                </div>
                <div className={styles.info}>
                  <span className={styles.email}>{sub.email}</span>
                  <span className={styles.date}>
                    <HiCalendar size={13} />
                    {formatDate(sub.subscribed_at)}
                  </span>
                </div>
              </div>

              <div className={styles.rowRight}>
                <span className={`${styles.statusBadge} ${sub.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                  {sub.status === 'active' ? (
                    <><HiCheckCircle size={12} /> Active</>
                  ) : (
                    <><HiXCircle size={12} /> Unsubscribed</>
                  )}
                </span>

                <div className={styles.actions}>
                  <button
                    onClick={() => handleToggleStatus(sub)}
                    className={styles.actionBtn}
                    title={sub.status === 'active' ? 'Unsubscribe' : 'Reactivate'}
                  >
                    {sub.status === 'active' ? <HiXCircle size={17} /> : <HiCheckCircle size={17} />}
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className={`${styles.actionBtn} ${styles.deleteBtn} ${deleteConfirm === sub.id ? styles.confirm : ''}`}
                    title={deleteConfirm === sub.id ? 'Click again to confirm' : 'Delete'}
                  >
                    <HiTrash size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
