import { FILE } from "dns";
import { connect } from "http2";

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

export const defaultConfig: ApiConfig = {
  // baseUrl: 'http://122.163.121.176:5005',
  // baseUrl: 'http://localhost:5005/',
  // baseUrl: 'http://157.173.221.226:3004',
  // baseUrl: 'http://187.127.163.17:3019',
  baseUrl: 'http://localhost:3019/',
  // baseUrl: 'http://157.173.221.226:3004',
  // baseUrl: 'http://187.127.163.17:3019',
  // baseUrl: 'http://72.61.226.68:3019/',
  timeout: 10000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    ADMIN_LOGIN: '/admin_login',
  },
  DATA_SOURCE: {
    CONNECTION_HISTORY: '/connection_history',
    CREATE_CONNECTORS: '/create_connectors',
    WEB_SEARCH: '/search',
  },
  IMPORT: {
    AGENT: '/agents',
    SESSION_SOURCES: '/session-sources',
    SESSION_ANALYSIS: '/session-analysis',
    SAVE_RESULT_SEARCH: '/save-result',
    CONTINUE_TO_IMPORT: '/connect-external-db',
    CSV_IMPORT: '/csv-import',
    GET_SAVED_RESULTS: '/saved-results',
    DELETE_SAVED_RESULT: '/saved-results',
    DESCRIBE_CONTENT: '/saved-content/describe',
  },
  CHAT: {
    CHAT: '/session-chat',
    DEFAULT_METRICS: '/default-dashboard-metrics',
  },

  DASHBOARD: {
    TYRE_SALES_DATA: '/tyre-sales-data',
    SALES_BY_ZONE: '/sales-by-zone',
    FILTERS: '/dashboard-filters/',
    YEAR_FILTER: '/available-years',
    YEAR_WISE_FILTER: '/year-wise-sales-comparison',
    SALES_REVENUE: '/sales-revenue',
    SALES_BY_ACCOUNT_CATEGORY: '/sales-by-account-category',
    NON_BILLED_ACCOUNTS: '/non-billed-accounts-pct',
    OVERDUE_PCT: '/overdue-pct',
    EXPOSURE_PCT: '/exposure-pct',
    CATEGORY_SALES: '/category-sales'

  },

  WORKSPACE: {
    CREATE: '/create_workspace',
    GET_WORKSPACES: '/workspaces',
    GET_ADMIN_WORKSPACES: '/get-workspace',
    SET_ACTIVE_WORKSPACE: '/set-active-workspace',
    ASSIGN_WORKSPACE_USERS: '/assign_workspace_users',
    WORKSPACE_USERS: '/workspace_users',
    DELETE: '/delete_workspace',
  },
  FILE_UPLOAD: {
    CSV_UPLOAD: '/upload_csv',
    CHUNK_UPLOAD: '/upload_chunk',
  },
  COMMON: {
    SESSION_CHAT_HISTORY: '/session-chat-history',
  },
  USERS: {
    GET_USERS: '/users',
    CREATE_USER: '/create_user',
    EDIT_USER: '/edit_user',
    DELETE_USER: '/delete_user',
  },
  // ─── FTP Connector ──────────────────────────────────────────────────────────
  FTP: {
    CONNECT: '/ftp/connect',
    FETCH: '/ftp/fetch',
    PROGRESS: '/ftp/progress',   // append /<job_id> at call site
    SCHEDULE_GET: '/ftp/schedule',
    SCHEDULE_POST: '/ftp/schedule',
    SCHEDULE_DELETE: '/ftp/schedule',
    FETCH_LOG: '/ftp/fetch_log',
  },
  ADMIN: {
    GET_CHATS: '/api/admin/chats',
    PUSH_TO_KG: '/api/admin/push_to_kg',
    GET_STAGED_KNOWLEDGE: '/api/admin/staged_knowledge',
    TRIGGER_INDEXING: '/api/admin/trigger_indexing'
  },
  PROMPTS: {
    GET_TYPES: '/api/prompt-types',
    WORKSPACE_PROMPT: '/api/workspace-prompt',
    GET_ALL_WORKSPACE_PROMPTS: '/api/workspace-prompts-all',
    DELETE_WORKSPACE_PROMPT: '/api/delete-workspace-prompt',
  },
  REPORTS: {
    RECIPIENTS: '/api/report-recipients',
    SCHEDULES: '/api/scheduled-reports',
    EXPORT_DOMESTIC_SALES: '/export-domestic-sales-report',
    EXPORT_DOMESTIC_SALES_PREVIEW: '/export-domestic-sales-preview',
  },
}

