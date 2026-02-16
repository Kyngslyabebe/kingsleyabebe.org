'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { HiHeart } from 'react-icons/hi2';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  blogId: string;
  initialLikes: number;
}

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('visitor_id', id);
  }
  return id;
}

export default function LikeButton({ blogId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);

    supabase
      .from('blog_likes')
      .select('id', { count: 'exact', head: true })
      .eq('blog_id', blogId)
      .then(({ count }) => { if (count !== null) setLikes(count); });

    supabase
      .from('blog_likes')
      .select('id')
      .eq('blog_id', blogId)
      .eq('user_email', `anon_${id}`)
      .maybeSingle()
      .then(({ data }) => setIsLiked(!!data));
  }, [blogId]);

  async function handleLike() {
    if (loading || !visitorId) return;

    setLoading(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    const anonId = `anon_${visitorId}`;

    try {
      if (isLiked) {
        await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_id', blogId)
          .eq('user_email', anonId);

        setLikes(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        await supabase
          .from('blog_likes')
          .insert({ blog_id: blogId, user_email: anonId });

        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`${styles.likeButton} ${isLiked ? styles.liked : ''} ${animating ? styles.animating : ''}`}
      aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
    >
      <HiHeart size={20} className={styles.icon} />
      <span className={styles.count}>{likes}</span>
      <span className={styles.label}>{likes === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}
