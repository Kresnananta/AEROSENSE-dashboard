/**
 * ============================================
 * AEROSENSE Dashboard — Application Constants
 * ============================================
 */

/** Application metadata */
export const APP_CONFIG = {
  name: 'AEROSENSE',
  description: 'Air Quality Monitoring Dashboard',
  version: '0.1.0',
} as const

/** Route path constants for type-safe navigation */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SENSOR_MAP: '/sensor-map',
  NODE_MONITORING: '/nodes',
  NODE_DETAIL: '/nodes/:id',
  ANALYTICS: '/analytics',
  ALERTS: '/alerts',
  ESG_REPORTS: '/esg-reports',
  SYSTEM: '/system',
} as const

/** Navigation items for sidebar */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    label: 'Peta Sensor',
    path: ROUTES.SENSOR_MAP,
    icon: 'MapPin',
  },
  {
    label: 'Monitoring Node',
    path: ROUTES.NODE_MONITORING,
    icon: 'Radio',
  },
  {
    label: 'Tren & Analitik',
    path: ROUTES.ANALYTICS,
    icon: 'BarChart3',
  },
  {
    label: 'Notifikasi',
    path: ROUTES.ALERTS,
    icon: 'Bell',
  },
  {
    label: 'Laporan ESG',
    path: ROUTES.ESG_REPORTS,
    icon: 'FileText',
  },
  {
    label: 'Pengaturan',
    path: ROUTES.SYSTEM,
    icon: 'Settings',
  },
] as const

/** API configuration */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
} as const
