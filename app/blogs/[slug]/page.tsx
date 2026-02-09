import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Fetch blog data using REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/blogs?slug=eq.${slug}&published=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseKey || '',
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 }
      }
    );

    const data = await response.json();
    const blog = data[0];

    if (!blog) {
      return {
        title: 'Blog Not Found',
      };
    }

    const siteUrl = 'https://kingsleyabebe.org';
    const imageUrl = blog.featured_image || `${siteUrl}/og-default.jpg`;
    const pageUrl = `${siteUrl}/blogs/${blog.slug}`; // ← Fixed: /blogs/ not /blog/

    return {
      title: blog.seo_title || blog.title,
      description: blog.seo_description || blog.excerpt,
      keywords: blog.seo_keywords,
      authors: [{ name: blog.author || 'Kingsley Abebe' }],
      openGraph: {
        title: blog.seo_title || blog.title,
        description: blog.seo_description || blog.excerpt,
        url: pageUrl,
        siteName: 'Kingsley Abebe',
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
        publishedTime: blog.published_at || blog.created_at,
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
        canonical: pageUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post',
    };
  }
}

// Server component
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}