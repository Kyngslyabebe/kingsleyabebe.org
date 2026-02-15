'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { HiHeart } from 'react-icons/hi2';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  blogId: string;
  initialLikes: number;
}

export default function LikeButton({ blogId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkIfLiked();
  }, [blogId]);

  async function checkIfLiked() {
    // Get email from localStorage (we'll save it when they comment)
    const email = localStorage.getItem('user_email');
    if (!email) return;

    setUserEmail(email);

    const { data } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('blog_id', blogId)
      .eq('user_email', email)
      .single();

    setIsLiked(!!data);
  }

  async function handleLike() {
    if (loading) return;

    // If no email, prompt for it
    if (!userEmail) {
      const email = prompt('Enter your email to like this post:');
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email');
        return;
      }
      localStorage.setItem('user_email', email);
      setUserEmail(email);
    }

    setLoading(true);

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_id', blogId)
          .eq('user_email', userEmail!);

        setLikes(likes - 1);
        setIsLiked(false);
      } else {
        // Like
        await supabase
          .from('blog_likes')
          .insert({
            blog_id: blogId,
            user_email: userEmail!,
          });

        setLikes(likes + 1);
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
      className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
    >
      <HiHeart size={20} className={styles.icon} />
      <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}