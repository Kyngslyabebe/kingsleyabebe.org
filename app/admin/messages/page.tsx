'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { 
  HiTrash, 
  HiEnvelope,
  HiEnvelopeOpen,
  HiCheckCircle,
  HiMagnifyingGlass,
  HiClock
} from 'react-icons/hi2';
import styles from './messages.module.css';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function MessagesPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

 async function loadMessages() {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('📬 Messages data:', data);
    console.log('❌ Messages error:', error);

    if (error) throw error;
    setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      showToast('Error loading messages', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      showToast('Status updated!', 'success');
      loadMessages();
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast('Error updating status', 'error');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      showToast('Message deleted successfully!', 'success');
      loadMessages();
    } catch (error: any) {
      console.error('Error deleting message:', error);
      showToast(error.message || 'Error deleting message', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      msg.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const newCount = messages.filter(m => m.status === 'new').length;
  const readCount = messages.filter(m => m.status === 'read').length;
  const repliedCount = messages.filter(m => m.status === 'replied').length;

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageSubtitle}>Contact form submissions</p>
        </div>
        <div className={styles.stats}>
          <span className={styles.statBadge}>
            <HiEnvelope size={14} />
            {newCount} New
          </span>
          <span className={styles.statBadge}>
            <HiEnvelopeOpen size={14} />
            {readCount} Read
          </span>
          <span className={styles.statBadge}>
            <HiCheckCircle size={14} />
            {repliedCount} Replied
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <HiMagnifyingGlass size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <button 
            onClick={() => setFilterStatus('all')}
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.filterBtnActive : ''}`}
          >
            All ({messages.length})
          </button>
          <button 
            onClick={() => setFilterStatus('new')}
            className={`${styles.filterBtn} ${filterStatus === 'new' ? styles.filterBtnActive : ''}`}
          >
            New ({newCount})
          </button>
          <button 
            onClick={() => setFilterStatus('read')}
            className={`${styles.filterBtn} ${filterStatus === 'read' ? styles.filterBtnActive : ''}`}
          >
            Read ({readCount})
          </button>
          <button 
            onClick={() => setFilterStatus('replied')}
            className={`${styles.filterBtn} ${filterStatus === 'replied' ? styles.filterBtnActive : ''}`}
          >
            Replied ({repliedCount})
          </button>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className={styles.emptyState}>
          <HiEnvelope size={48} />
          <h3>No messages found</h3>
          <p>{searchTerm ? 'Try a different search term' : 'No messages yet'}</p>
        </div>
      ) : (
        <div className={styles.messageList}>
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={styles.messageCard}>
              <div className={styles.messageHeader}>
                <div className={styles.messageInfo}>
                  <div className={styles.messageMeta}>
                    <h3 className={styles.messageName}>{msg.name}</h3>
                    <span className={`${styles.statusBadge} ${styles[`status${msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}`]}`}>
                      {msg.status === 'new' && <HiEnvelope size={12} />}
                      {msg.status === 'read' && <HiEnvelopeOpen size={12} />}
                      {msg.status === 'replied' && <HiCheckCircle size={12} />}
                      {msg.status}
                    </span>
                  </div>
                  <a href={`mailto:${msg.email}`} className={styles.messageEmail}>
                    {msg.email}
                  </a>
                  <p className={styles.messageDate}>
                    <HiClock size={14} />
                    {new Date(msg.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className={styles.messageActions}>
                  {msg.status === 'new' && (
                    <button 
                      onClick={() => updateStatus(msg.id, 'read')}
                      className={styles.actionBtn}
                      title="Mark as read"
                    >
                      <HiEnvelopeOpen size={16} />
                    </button>
                  )}
                  {msg.status === 'read' && (
                    <button 
                      onClick={() => updateStatus(msg.id, 'replied')}
                      className={styles.actionBtn}
                      title="Mark as replied"
                    >
                      <HiCheckCircle size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => setDeleteId(msg.id)}
                    className={styles.deleteBtn}
                    title="Delete"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.messageContent}>
                {expandedId === msg.id ? (
                  <>
                    <p className={styles.messageFull}>{msg.message}</p>
                    <button 
                      onClick={() => setExpandedId(null)}
                      className={styles.toggleBtn}
                    >
                      Show less
                    </button>
                  </>
                ) : (
                  <>
                    <p className={styles.messagePreview}>
                      {msg.message.length > 150 
                        ? `${msg.message.substring(0, 150)}...` 
                        : msg.message
                      }
                    </p>
                    {msg.message.length > 150 && (
                      <button 
                        onClick={() => setExpandedId(msg.id)}
                        className={styles.toggleBtn}
                      >
                        Read more
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Message?"
        message="This action cannot be undone. Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}