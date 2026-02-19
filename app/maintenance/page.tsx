import { createClient } from '@supabase/supabase-js';
import { FaXTwitter } from 'react-icons/fa6';
import styles from './maintenance.module.css';

async function getMaintenanceInfo() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('personal_info')
    .select('maintenance_message, maintenance_eta, name')
    .single();

  return data;
}

export default async function MaintenancePage() {
  const info = await getMaintenanceInfo();

  return (
    <div className={styles.container}>
      <div className={styles.content}>

        {/* Icon */}
        <div className={styles.iconWrap}>
          <span className={styles.icon}>🔧</span>
        </div>

        {/* Heading */}
        <h1 className={styles.title}>We&apos;ll be right back</h1>
        <p className={styles.subtitle}>Under maintenance</p>

        {/* Message */}
        <div className={styles.messageCard}>
          <p className={styles.message}>
            {info?.maintenance_message ||
              "We\u2019re doing a bit of work behind the scenes to make things better. Nothing is broken \u2014 we\u2019re just improving. Check back shortly."}
          </p>
        </div>

        {/* ETA */}
        {info?.maintenance_eta && (
          <div className={styles.etaCard}>
            <span className={styles.etaIcon}>⏱</span>
            <div>
              <p className={styles.etaLabel}>Expected back</p>
              <p className={styles.etaTime}>{info.maintenance_eta}</p>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} />
        </div>

        {/* Divider + Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>Thanks for your patience.</p>
          <p className={styles.signature}>— {info?.name || 'Kingsley Abebe'}</p>
        </div>

        {/* Social */}
        <div className={styles.socialSection}>
          <p className={styles.socialLabel}>Follow for updates</p>
          <a
            href="https://x.com/kyngslyRF"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
          
          </a>
        </div>

      </div>
    </div>
  );
}
