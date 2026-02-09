import { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';
import BlogPostClient from './BlogPostClient';

interface Props {
  params: Promise<{ slug: string }>; // ← Changed to Promise
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // ← Added await
  
  try {
    const { data: blog } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (!blog) {
      return {
        title: 'Blog Not Found',
      };
    }

    const siteUrl = 'https://kingsleyabebe.org';
    const imageUrl = blog.featured_image || `${siteUrl}/og-default.jpg`;

    return {
      title: blog.seo_title || blog.title,
      description: blog.seo_description || blog.excerpt,
      keywords: blog.seo_keywords,
      authors: [{ name: blog.author || 'Kingsley Abebe' }],
      openGraph: {
        title: blog.seo_title || blog.title,
        description: blog.seo_description || blog.excerpt,
        url: `${siteUrl}/blog/${blog.slug}`,
        siteName: 'Kingsley Abebe - Full-Stack Developer',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: blog.published_at,
        authors: [blog.author || 'Kingsley Abebe'],
        tags: blog.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.seo_title || blog.title,
        description: blog.seo_description || blog.excerpt,
        creator: '@InfinitBooking',
        site: '@InfinitBooking',
        images: [imageUrl],
      },
      alternates: {
        canonical: `${siteUrl}/blog/${blog.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post',
    };
  }
}

// Server component - just passes slug to client component
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params; // ← Added await
  return <BlogPostClient slug={slug} />;
}