import { FILE } from "dns";
import { connect } from "http2";

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

export const defaultConfig: ApiConfig = {
  // baseUrl: 'http://122.163.121.176:3019',
  // baseUrl: 'http://localhost:3019/',
  // baseUrl: 'http://157.173.221.226:3004',
  baseUrl: 'http://187.127.163.17:3019',
  timeout: 10000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
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
    YEAR_WISE_FILTER: '/year-wise-sales-comparison'


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
  }

};

// top 2 customers

// top 2 dealers

// top 2 customers with 3 months sales

// worst 2 customers

// worst performers along with their monthly sales value

// worst 2 performers along with their product categoy wise sales breakup

