'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  HiRectangleGroup,
  HiCodeBracket,
  HiEnvelope,
  HiBriefcase,
  HiNewspaper,
  HiPhoto,
  HiArrowTrendingUp,
  HiEye,
  HiChartBar,
  HiCog,
  HiChatBubbleLeft,
  HiUsers
} from 'react-icons/hi2';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    projects: 0,
    projectsVisible: 0,
    skills: 0,
    skillsVisible: 0,
    messages: 0,
    messagesNew: 0,
    experience: 0,
    experienceVisible: 0,
    blogs: 0,
    blogsPublished: 0,
    showcase: 0,
    services: 0,
    servicesVisible: 0,
    comments: 0,
    commentsPending: 0,
    subscribers: 0,
    subscribersActive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('visible');
      
      if (projectsError) console.error('Projects error:', projectsError);
      const projectsVisible = projectsData?.filter(p => p.visible).length || 0;

      // Fetch skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('visible');
      
      if (skillsError) console.error('Skills error:', skillsError);
      const skillsVisible = skillsData?.filter(s => s.visible).length || 0;

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('status');
      
      if (messagesError) console.error('Messages error:', messagesError);
      const messagesNew = messagesData?.filter(m => m.status === 'new').length || 0;

      // Fetch experience
      const { data: experienceData, error: experienceError } = await supabase
        .from('experience')
        .select('visible');
      
      if (experienceError) console.error('Experience error:', experienceError);
      const experienceVisible = experienceData?.filter(e => e.visible).length || 0;

      // Fetch blogs
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('published');
      
      if (blogsError) console.error('Blogs error:', blogsError);
      const blogsPublished = blogsData?.filter(b => b.published).length || 0;

      // Fetch showcase
      const { count: showcaseCount, error: showcaseError } = await supabase
        .from('hero_showcase')
        .select('*', { count: 'exact', head: true });
      
      if (showcaseError) console.error('Showcase error:', showcaseError);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('visible');
      
      if (servicesError) console.error('Services error:', servicesError);
      const servicesVisible = servicesData?.filter(s => s.visible).length || 0;

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('blog_comments')
        .select('approved');

      if (commentsError) console.error('Comments error:', commentsError);
      const commentsPending = commentsData?.filter(c => !c.approved).length || 0;

      // Fetch subscribers via API route (uses service role key to bypass RLS)
      let subscribersData: any[] = [];
      try {
        const subsRes = await fetch('/api/subscribers');
        const subsJson = await subsRes.json();
        subscribersData = subsJson.subscribers || [];
      } catch (e) {
        console.error('Subscribers fetch error:', e);
      }
      const subscribersActive = subscribersData.filter((s: any) => s.status === 'active').length;

      setStats({
        projects: projectsData?.length || 0,
        projectsVisible,
        skills: skillsData?.length || 0,
        skillsVisible,
        messages: messagesData?.length || 0,
        messagesNew,
        experience: experienceData?.length || 0,
        experienceVisible,
        blogs: blogsData?.length || 0,
        blogsPublished,
        showcase: showcaseCount || 0,
        services: servicesData?.length || 0,
        servicesVisible,
        comments: commentsData?.length || 0,
        commentsPending,
        subscribers: subscribersData?.length || 0,
        subscribersActive,
      });

      // Fetch recent messages
      const { data: recentMessagesData, error: recentMsgError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentMsgError) console.error('Recent messages error:', recentMsgError);
      setRecentMessages(recentMessagesData || []);

      // Fetch recent blogs
      const { data: recentBlogsData, error: recentBlogsError } = await supabase
        .from('blogs')
        .select('id, title, published, created_at, views')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentBlogsError) console.error('Recent blogs error:', recentBlogsError);
      setRecentBlogs(recentBlogsData || []);

      // Fetch recent comments
      const { data: recentCommentsData, error: recentCommentsError } = await supabase
        .from('blog_comments')
        .select(`
          *,
          blogs(title, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentCommentsError) console.error('Recent comments error:', recentCommentsError);
      setRecentComments(recentCommentsData || []);

      // Recent subscribers (already fetched via API above)
      setRecentSubscribers(subscribersData.slice(0, 5));

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { 
      icon: HiRectangleGroup, 
      label: 'Projects', 
      value: stats.projects, 
      secondary: `${stats.projectsVisible} visible`,
      color: '#4A90E2',
      link: '/admin/projects'
    },
    { 
      icon: HiCodeBracket, 
      label: 'Skills', 
      value: stats.skills, 
      secondary: `${stats.skillsVisible} visible`,
      color: '#48BB78',
      link: '/admin/skills'
    },
    { 
      icon: HiCog, 
      label: 'Services', 
      value: stats.services, 
      secondary: `${stats.servicesVisible} visible`,
      color: '#667eea',
      link: '/admin/services'
    },
    { 
      icon: HiNewspaper, 
      label: 'Blogs', 
      value: stats.blogs, 
      secondary: `${stats.blogsPublished} published`,
      color: '#9F7AEA',
      link: '/admin/blogs'
    },
    { 
      icon: HiChatBubbleLeft, 
      label: 'Comments', 
      value: stats.comments, 
      secondary: `${stats.commentsPending} pending`,
      color: '#EC4899',
      link: '/admin/comments'
    },
    { 
      icon: HiBriefcase, 
      label: 'Experience', 
      value: stats.experience, 
      secondary: `${stats.experienceVisible} visible`,
      color: '#F6AD55',
      link: '/admin/experience'
    },
    { 
      icon: HiEnvelope, 
      label: 'Messages', 
      value: stats.messages, 
      secondary: `${stats.messagesNew} new`,
      color: '#E74C3C',
      link: '/admin/messages'
    },
    {
      icon: HiPhoto,
      label: 'Showcase',
      value: stats.showcase,
      secondary: 'images',
      color: '#3498DB',
      link: '/admin/showcase'
    },
    {
      icon: HiUsers,
      label: 'Subscribers',
      value: stats.subscribers,
      secondary: `${stats.subscribersActive} active`,
      color: '#48BB78',
      link: '/admin/subscribers'
    },
  ];

  const quickActions = [
    { icon: HiRectangleGroup, label: 'New Project', link: '/admin/projects', color: '#4A90E2' },
    { icon: HiCog, label: 'New Service', link: '/admin/services', color: '#667eea' },
    { icon: HiNewspaper, label: 'New Blog', link: '/admin/blogs/create', color: '#9F7AEA' },
    { icon: HiCodeBracket, label: 'New Skill', link: '/admin/skills', color: '#48BB78' },
    { icon: HiBriefcase, label: 'New Experience', link: '/admin/experience', color: '#F6AD55' },
    { icon: HiChatBubbleLeft, label: 'Moderate Comments', link: '/admin/comments', color: '#EC4899' },
    { icon: HiUsers, label: 'View Subscribers', link: '/admin/subscribers', color: '#48BB78' },
  ];

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <div>
          <h1 className={styles.welcomeTitle}>Dashboard</h1>
          <p className={styles.welcomeSubtitle}>Welcome back! Here's what's happening</p>
        </div>
        <button onClick={loadData} className={styles.refreshBtn}>
          <HiChartBar size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => router.push(stat.link)}
              className={styles.statCard}
              style={{ '--stat-color': stat.color } as React.CSSProperties}
            >
              <div className={styles.statIcon}>
                <Icon size={20} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statSecondary}>{stat.secondary}</span>
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
                onClick={() => router.push(action.link)}
                className={styles.actionBtn}
                style={{ '--action-color': action.color } as React.CSSProperties}
              >
                <Icon size={18} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Content Grid */}
      <div className={styles.recentGrid}>
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
                    <span className={`${styles.messageBadge} ${styles[`badge${message.status.charAt(0).toUpperCase() + message.status.slice(1)}`]}`}>
                      {message.status}
                    </span>
                  </div>
                  <p className={styles.messageEmail}>{message.email}</p>
                  <p className={styles.messagePreview}>
                    {message.message.length > 80 
                      ? `${message.message.substring(0, 80)}...` 
                      : message.message}
                  </p>
                  <span className={styles.messageDate}>
                    {new Date(message.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Comments */}
        {recentComments.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Comments</h2>
              <button 
                onClick={() => router.push('/admin/comments')}
                className={styles.viewAllBtn}
              >
                View All
              </button>
            </div>
            <div className={styles.messagesList}>
              {recentComments.map((comment) => (
                <div key={comment.id} className={styles.messageCard}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageName}>{comment.user_name}</span>
                    <span className={`${styles.messageBadge} ${comment.approved ? styles.badgeApproved : styles.badgePending}`}>
                      {comment.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className={styles.messagePreview}>
                    {comment.content.length > 80
                      ? `${comment.content.substring(0, 80)}...`
                      : comment.content}
                  </p>
                  <p className={styles.blogName}>
                    On: {comment.blogs?.title || 'Unknown Blog'}
                  </p>
                  <span className={styles.messageDate}>
                    {new Date(comment.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Subscribers */}
        {recentSubscribers.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Subscribers</h2>
              <button
                onClick={() => router.push('/admin/subscribers')}
                className={styles.viewAllBtn}
              >
                View All ({stats.subscribers})
              </button>
            </div>
            <div className={styles.subSummary}>
              <span className={styles.subSummaryItem} style={{ color: '#48BB78' }}>
                {stats.subscribersActive} active
              </span>
              <span className={styles.subSummaryDot} />
              <span className={styles.subSummaryItem} style={{ color: '#A0AEC0' }}>
                {stats.subscribers - stats.subscribersActive} unsubscribed
              </span>
            </div>
            <div className={styles.subList}>
              {recentSubscribers.map((sub) => (
                <div key={sub.id} className={styles.subItem}>
                  <div className={styles.subAvatar}>
                    {sub.email.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.subInfo}>
                    <span className={styles.subEmail}>{sub.email}</span>
                    <span className={styles.subDate}>
                      {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className={`${styles.subBadge} ${sub.status === 'active' ? styles.subBadgeActive : styles.subBadgeInactive}`}>
                    {sub.status === 'active' ? 'Active' : 'Unsub'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Blogs */}
        {recentBlogs.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Blogs</h2>
              <button 
                onClick={() => router.push('/admin/blogs')}
                className={styles.viewAllBtn}
              >
                View All
              </button>
            </div>
            <div className={styles.blogsList}>
              {recentBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  className={styles.blogCard}
                  onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                >
                  <div className={styles.blogHeader}>
                    <h3 className={styles.blogTitle}>{blog.title}</h3>
                    <span className={`${styles.blogBadge} ${blog.published ? styles.badgePublished : styles.badgeDraft}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className={styles.blogMeta}>
                    <span className={styles.blogViews}>
                      <HiEye size={14} />
                      {blog.views || 0} views
                    </span>
                    <span className={styles.blogDate}>
                      {new Date(blog.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}