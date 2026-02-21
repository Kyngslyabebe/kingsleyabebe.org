import { createClient } from '@supabase/supabase-js';
import BackToHome from '@/components/common/BackToHome';
import styles from './legal.module.css';

async function getLegalDocument() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('document_type', 'terms-of-service')
    .eq('is_active', true)
    .single();

  return data;
}

async function getPersonalInfo() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('personal_info')
    .select('name, email, website')
    .single();
  return data;
}

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using our services',
};

export default async function TermsOfServicePage() {
  const [legalDoc, info] = await Promise.all([getLegalDocument(), getPersonalInfo()]);
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <BackToHome />

      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>{legalDoc?.title || 'Terms of Service'}</h1>
          <p className={styles.subtitle}>
            Last updated: {legalDoc?.last_updated
              ? new Date(legalDoc.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            }
          </p>
        </header>

        <div className={styles.legalContent}>
          {legalDoc?.content ? (
            <div className={styles.dynamicContent}>
              {legalDoc.content.split('\n').map((line: string, index: number) => {
                // Handle headings (markdown-style)
                if (line.startsWith('# ')) {
                  const headingText = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  return <h2 key={index} className={styles.heading} dangerouslySetInnerHTML={{ __html: headingText }} />;
                }
                if (line.startsWith('## ')) {
                  const subheadingText = line.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  return <h3 key={index} className={styles.subheading} dangerouslySetInnerHTML={{ __html: subheadingText }} />;
                }
                // Handle list items with bold text support
                if (line.trim().startsWith('- ')) {
                  const listText = line.substring(2).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  return <p key={index} className={styles.listItem} dangerouslySetInnerHTML={{ __html: '• ' + listText }} />;
                }
                // Skip empty lines (paragraph margins provide spacing)
                if (line.trim() === '') {
                  return null;
                }
                // Regular paragraphs with bold text
                const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <p key={index} className={styles.contentParagraph} dangerouslySetInnerHTML={{ __html: boldText }} />;
              })}
            </div>
          ) : (
            <div className={styles.fallbackContent}>
              <p>Terms of service content is being updated. Please check back soon or contact us at {info?.email} for more information.</p>
            </div>
          )}

          <footer className={styles.footer}>
            <p>© {currentYear} {info?.name || 'All rights reserved'}. All rights reserved.</p>
            {info?.email && (
              <div className={styles.contactInfo}>
                <p><strong>Contact:</strong> {info.name}</p>
                <p>Email: <a href={`mailto:${info.email}`}>{info.email}</a></p>
                {info.website && <p>Website: <a href={info.website} target="_blank" rel="noopener noreferrer">{info.website}</a></p>}
              </div>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
