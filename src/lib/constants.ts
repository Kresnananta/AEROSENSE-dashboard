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
  ANALYTICS: '/analytics',
  SENSORS: '/sensors',
  SENSOR_DETAIL: '/sensors/:id',
  SETTINGS: '/settings',
} as const

/** Navigation items for sidebar */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    label: 'Analytics',
    path: ROUTES.ANALYTICS,
    icon: 'BarChart3',
  },
  {
    label: 'Sensors',
    path: ROUTES.SENSORS,
    icon: 'Radio',
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: 'Settings',
  },
] as const

/** API configuration */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
} as const
