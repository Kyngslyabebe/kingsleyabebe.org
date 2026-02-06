import { createClient } from '@supabase/supabase-js';
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
      {/* Animated Background */}
      <div className={styles.bgShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.content}>
        {/* Icon Container */}
        <div className={styles.iconContainer}>
          <div className={styles.iconBg}>
            <div className={styles.icon}>🔧</div>
          </div>
        </div>

        {/* Main Content */}
        <h1 className={styles.title}>We'll Be Right Back</h1>
        <p className={styles.subtitle}>Currently Under Maintenance</p>
        
        <div className={styles.messageCard}>
          <p className={styles.message}>
            {info?.maintenance_message || 
             "We're currently upgrading our systems to serve you better. Please check back soon!"}
          </p>
        </div>

        {info?.maintenance_eta && (
          <div className={styles.etaCard}>
            <div className={styles.etaIcon}>⏱️</div>
            <div>
              <p className={styles.etaLabel}>Estimated Return</p>
              <p className={styles.etaTime}>{info.maintenance_eta}</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>Thank you for your patience!</p>
          <p className={styles.signature}>
            <span className={styles.dash}>—</span> {info?.name || 'Kingsley Abebe'}
          </p>
        </div>

        {/* Social Links */}
        <div className={styles.socialHint}>
          <p>Follow us for updates</p>
        </div>
      </div>
    </div>
  );
}