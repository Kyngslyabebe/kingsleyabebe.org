'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HiSignal, HiUsers, HiEye } from 'react-icons/hi2';
import styles from './AnalyticsPanel.module.css';

interface PageView {
  date: string;
  view_count: number;
}

interface AnalyticsData {
  pageViews: PageView[];
  activeNow: number;
  totalSubscribers: number;
  totalBlogViews: number;
}

interface ChartDataPoint {
  label: string;
  views: number;
}

function formatChartData(pageViews: PageView[], period: '7d' | '30d'): ChartDataPoint[] {
  const days = period === '7d' ? 7 : 30;
  const now = new Date();
  const result: ChartDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const match = pageViews.find(pv => pv.date === dateStr);
    result.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: match?.view_count || 0,
    });
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} visits</p>
    </div>
  );
}

export default function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silently fail
    }
  }, []);

  const trackVisit = useCallback(async () => {
    try {
      let sessionId = sessionStorage.getItem('analytics_session');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('analytics_session', sessionId);
      }
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    trackVisit();
    fetchStats();

    // Heartbeat every 30s
    const heartbeat = setInterval(trackVisit, 30000);
    // Refresh stats every 60s
    const statsRefresh = setInterval(fetchStats, 60000);

    return () => {
      clearInterval(heartbeat);
      clearInterval(statsRefresh);
    };
  }, [trackVisit, fetchStats]);

  const chartData = data ? formatChartData(data.pageViews, period) : [];
  const totalViews = chartData.reduce((sum, d) => sum + d.views, 0);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.panelTitle}>Live Analytics</h3>
          <span className={styles.totalViews}>{totalViews} visits</span>
        </div>
        <div className={styles.periodToggle}>
          <button
            className={`${styles.periodBtn} ${period === '7d' ? styles.periodActive : ''}`}
            onClick={() => setPeriod('7d')}
          >
            7D
          </button>
          <button
            className={`${styles.periodBtn} ${period === '30d' ? styles.periodActive : ''}`}
            onClick={() => setPeriod('30d')}
          >
            30D
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#A0AEC0' }}
              interval={period === '7d' ? 0 : 4}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#A0AEC0' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#667eea"
              strokeWidth={2}
              fill="url(#viewsGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#667eea', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Stats */}
      <div className={styles.miniStats}>
        <div className={`${styles.miniCard} ${styles.cardGreen}`}>
          <div className={styles.miniIcon}>
            <span className={styles.liveDot} />
            <HiSignal size={16} />
          </div>
          <span className={styles.miniValue}>{data?.activeNow ?? '—'}</span>
          <span className={styles.miniLabel}>Active Now</span>
        </div>
        <div className={`${styles.miniCard} ${styles.cardAmber}`}>
          <div className={styles.miniIcon}>
            <HiUsers size={16} />
          </div>
          <span className={styles.miniValue}>{data?.totalSubscribers ?? '—'}</span>
          <span className={styles.miniLabel}>Subscribers</span>
        </div>
        <div className={`${styles.miniCard} ${styles.cardCyan}`}>
          <div className={styles.miniIcon}>
            <HiEye size={16} />
          </div>
          <span className={styles.miniValue}>{data?.totalBlogViews ?? '—'}</span>
          <span className={styles.miniLabel}>Blog Views</span>
        </div>
      </div>
    </div>
  );
}
