'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  HiHome,
  HiRectangleGroup,
  HiCodeBracket,
  HiClock,
  HiBriefcase,
  HiNewspaper,
  HiPhoto,
  HiEnvelope,
  HiChatBubbleLeft,
  HiCog6Tooth,
  HiDocumentText,
  HiChevronDown,
  HiChevronRight,
  HiBars3,
  HiXMark,
  HiUser,
  HiGlobeAlt,
  HiWrenchScrewdriver
} from 'react-icons/hi2';
import styles from './Sidebar.module.css';

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

const navigationGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { icon: HiHome, label: 'Dashboard', href: '/admin' }
    ]
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      { icon: HiRectangleGroup, label: 'Projects', href: '/admin/projects' },
      { icon: HiCodeBracket, label: 'Skills', href: '/admin/skills' },
      { icon: HiClock, label: 'Experience', href: '/admin/experience' },
      { icon: HiBriefcase, label: 'Services', href: '/admin/services' },
      { icon: HiNewspaper, label: 'Blogs', href: '/admin/blogs' },
      { icon: HiPhoto, label: 'Showcase', href: '/admin/showcase' }
    ]
  },
  {
    id: 'engagement',
    label: 'Engagement',
    items: [
      { icon: HiEnvelope, label: 'Messages', href: '/admin/messages' },
      { icon: HiChatBubbleLeft, label: 'Comments', href: '/admin/comments' },
      { icon: HiUser, label: 'Subscribers', href: '/admin/subscribers' }
    ]
  },
  {
    id: 'configuration',
    label: 'Configuration',
    items: [
      { icon: HiDocumentText, label: 'Legal', href: '/admin/legal' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { icon: HiUser, label: 'Profile', href: '/admin/settings?tab=profile' },
      { icon: HiEnvelope, label: 'Contact', href: '/admin/settings?tab=contact' },
      { icon: HiBriefcase, label: 'Professional', href: '/admin/settings?tab=professional' },
      { icon: HiGlobeAlt, label: 'SEO', href: '/admin/settings?tab=seo' },
      { icon: HiWrenchScrewdriver, label: 'Maintenance', href: '/admin/settings?tab=maintenance' },
      { icon: HiCog6Tooth, label: 'Advanced', href: '/admin/settings?tab=advanced' }
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpen, onClose, onCollapsedChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['overview', 'content', 'engagement', 'configuration', 'settings']);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('admin-sidebar-collapsed');
    if (savedCollapsed !== null) {
      const collapsedState = JSON.parse(savedCollapsed);
      setCollapsed(collapsedState);
      onCollapsedChange?.(collapsedState);
    }

    const savedExpandedGroups = localStorage.getItem('admin-sidebar-expanded');
    if (savedExpandedGroups) {
      setExpandedGroups(JSON.parse(savedExpandedGroups));
    }
  }, [onCollapsedChange]);

  // Save collapsed state
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
    onCollapsedChange?.(newState);
  };

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    const newExpandedGroups = expandedGroups.includes(groupId)
      ? expandedGroups.filter(id => id !== groupId)
      : [...expandedGroups, groupId];

    setExpandedGroups(newExpandedGroups);
    localStorage.setItem('admin-sidebar-expanded', JSON.stringify(newExpandedGroups));
  };

  // Navigate to page
  const navigateTo = (href: string) => {
    router.push(href);
    // Close mobile sidebar after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Check if current path matches
  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    // For settings with query params, check both path and query
    if (href.includes('?tab=')) {
      const [path, query] = href.split('?');
      if (!pathname.startsWith(path)) return false;
      if (typeof window !== 'undefined') {
        const currentQuery = window.location.search;
        return currentQuery.includes(query);
      }
      return false;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${isOpen ? styles.open : ''}`}>

        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          {!collapsed && <span className={styles.logo}>Admin Panel</span>}

          {/* Desktop: Collapse Button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className={styles.collapseBtn}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <HiChevronRight size={20} /> : <HiChevronDown size={20} />}
          </button>

          {/* Mobile: Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={styles.mobileCloseBtn}
            title="Close sidebar"
          >
            <HiXMark size={24} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className={styles.nav}>
          {navigationGroups.map((group) => {
            const isGroupExpanded = expandedGroups.includes(group.id);
            const hasActiveItem = group.items.some(item => isActive(item.href));

            return (
              <div key={group.id} className={styles.navGroup}>

                {/* Group Header */}
                {group.items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => !collapsed && toggleGroup(group.id)}
                    className={`${styles.groupHeader} ${hasActiveItem ? styles.groupHeaderActive : ''}`}
                    title={collapsed ? group.label : undefined}
                  >
                    {!collapsed && <span className={styles.groupLabel}>{group.label}</span>}
                    {!collapsed && (
                      <span className={styles.groupChevron}>
                        {isGroupExpanded ? <HiChevronDown size={16} /> : <HiChevronRight size={16} />}
                      </span>
                    )}
                  </button>
                ) : (
                  !collapsed && <div className={styles.groupHeaderSingle}>{group.label}</div>
                )}

                {/* Group Items */}
                <div className={`${styles.groupItems} ${isGroupExpanded || collapsed ? styles.groupItemsExpanded : ''}`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <button
                        type="button"
                        key={item.href}
                        onClick={() => navigateTo(item.href)}
                        className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon size={20} className={styles.navIcon} />
                        {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer - Collapse Toggle Hint */}
        {!collapsed && (
          <div className={styles.sidebarFooter}>
            <div className={styles.footerHint}>
              <span>Press to collapse</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
