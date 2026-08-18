import { FILE } from "dns";
import { connect } from "http2";

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

export const defaultConfig: ApiConfig = {
  // baseUrl: 'http://122.163.121.176:5005',
  baseUrl: 'http://localhost:3019/',
  // baseUrl: 'http://157.173.221.226:3004',
  // baseUrl: 'http://187.127.163.17:3019',
  //  baseUrl:'http://72.61.226.68:3019/',
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
  REPORTS: {
    RECIPIENTS: '/api/report-recipients',
    SCHEDULES: '/api/scheduled-reports',
    EXPORT_DOMESTIC_SALES: '/export-domestic-sales-report',
    EXPORT_DOMESTIC_SALES_PREVIEW: '/export-domestic-sales-preview',
  }
};

// top 2 customers

// top 2 dealers

// top 2 customers with 3 months sales

// worst 2 customers

// worst performers along with their monthly sales value

// worst 2 performers along with their product categoy wise sales breakup

// SELECT `customer_master`.`KUNNR` AS `customer_id`, COALESCE(`customer_master`.`Cname`, 'N/A') AS `customer_name`, SUM(`sales_data`.`Invoice_Value_INR`) AS `total_sales` FROM `sales_data` LEFT JOIN `customer_master` ON `sales_data`.`customer` = `customer_master`.`KUNNR` GROUP BY `customer_master`.`KUNNR`, `customer_master`.`Cname` ORDER BY `total_sales` DESC, `customer_id` ASC LIMIT 10;

// -- use jk1_3_db
// -- SELECT * FROM jk1_3_db.class_master;
// -- SELECT * FROM jk1_3_db.category_master;
// -- SELECT * FROM jk1_3_db.account_group_master;
// -- SELECT * FROM jk1_3_db.category_master;
// -- SELECT * FROM jk1_3_db.customer_master;
// -- SELECT * FROM jk1_3_db.construction_master;
// -- SELECT * FROM jk1_3_db.region_master;
// -- SELECT count(*) FROM jk1_3_db.sales_data;
// -- SELECT * FROM jk1_3_db.sku_master;
// -- SELECT * FROM jk1_3_db.territory_master;
// -- SELECT * FROM jk1_3_db.tyre_type_master;

// -- SELECT
// --     MONTHNAME(sd.billing__doc_date) AS month_name,
// --     MONTH(sd.billing__doc_date) AS month_no,
// --     YEAR(sd.billing__doc_date) AS sales_year,
// --     ROUND(
// --         SUM(
// --             CAST(
// --                 REPLACE(TRIM(sd.Invoice_Value_INR), ',', '')
// --                 AS DECIMAL(18,2)
// --             )
// --         ),
// --         2
// --     ) AS total_sales
// -- FROM sales_data sd
// -- LEFT JOIN customer_master cm
// --     ON sd.customer = cm.KUNNR
// -- WHERE sd.billing__doc_date IS NOT NULL

// -- -- Dynamic Filters
// -- -- AND YEAR(sd.invoice_date) IN (2026)
// -- -- AND MONTHNAME(sd.invoice_date) IN ('April','May','June')
// -- -- AND sd.Zone IN ('North')
// -- -- AND sd.Region IN ('Delhi')
// -- -- AND UPPER(cm.customer_type) IN ('DEALER')

// -- GROUP BY
// --     YEAR(sd.billing__doc_date),
// --     MONTH(sd.billing__doc_date),
// --     MONTHNAME(sd.billing__doc_date)

// -- ORDER BY
// --     sales_year ASC,
//     -- month_no ASC;
    
    
    
//  --    
// --     WITH customer_sales AS (
// --     SELECT
// --         s.customer,
// --         cm.Cname AS customer_name,
// --         SUM(s.Invoice_Value_INR) AS total_sales
// --     FROM sales_data s
// --     JOIN customer_master cm
// --         ON s.customer = cm.KUNNR
// --   --   WHERE cm.acc_grp = 'Z001'      -- Dealer
// --     GROUP BY s.customer, cm.Cname
// --     -- HAVING SUM(s.Invoice_Value_INR) > 0  -- if we consider negativevalues also
// -- ),

// -- worst_two AS (
// --     SELECT *
// --     FROM customer_sales
// --     ORDER BY total_sales ASC
// --    -- LIMIT 2
// -- )

// -- SELECT
// --     wt.customer,
// --     wt.customer_name,
// --     cat.category_name AS product_category,
// --     ROUND(SUM(s.Invoice_Value_INR),2) AS category_wise_sales,
// --     ROUND(wt.total_sales,2) AS total_customer_sales
// -- FROM worst_two wt
// -- JOIN sales_data s
// --     ON wt.customer = s.customer
// -- JOIN sku_master sm
// --     ON s.material = sm.MATNR
// -- JOIN category_master cat
// --     ON sm.category = cat.category_code
// --    --  where wt.customer = '1406389'
// -- GROUP BY
// --     wt.customer,
// --     wt.customer_name,
// --     cat.category_name,
// --     wt.total_sales
// -- ORDER BY
// --     wt.total_sales ASC,
// --     category_wise_sales DESC;



// -- WITH customer_sales AS (
// --     SELECT
// --         s.customer,
// --         COALESCE(cm.Cname, 'Customer Name Not Available') AS customer_name,
// --         SUM(s.Invoice_Value_INR) AS total_sales
// --     FROM sales_data s
// --     LEFT JOIN customer_master cm
// --         ON s.customer = cm.KUNNR
// --     GROUP BY
// --         s.customer,
// --         customer_name
// -- ),

// -- worst_two AS (
// --     SELECT *
// --     FROM customer_sales
// --     ORDER BY
// --         total_sales ASC,
// --         customer ASC
// --     LIMIT 2
// -- )

// -- SELECT
// --     wt.customer,
// --     wt.customer_name,
// --     con.construction_description AS product_construction,
// --     ROUND(SUM(s.Invoice_Value_INR), 2) AS construction_wise_sales,
// --     ROUND(wt.total_sales, 2) AS total_customer_sales
// -- FROM worst_two wt
// -- JOIN sales_data s
// --     ON wt.customer = s.customer
// -- JOIN sku_master sm
// --     ON s.material = sm.MATNR
// -- JOIN construction_master con
// --     ON sm.construction = con.construction_code
// -- GROUP BY
// --     wt.customer,
// --     wt.customer_name,
// --     con.construction_description,
// --     wt.total_sales
// -- ORDER BY
// --     wt.total_sales ASC,
// --     construction_wise_sales DESC;




// -- use jk1_3_db
// WITH customer_sales AS (
//     SELECT
//         s.customer,
//         COALESCE(cm.Cname, 'Customer Name Not Available') AS customer_name,
//         SUM(s.Invoice_Value_INR) AS total_sales
//     FROM sales_data s
//     LEFT JOIN customer_master cm
//         ON s.customer = cm.KUNNR
//     GROUP BY
//         s.customer,
//         customer_name
// ),

// worst_two AS (
//     SELECT *
//     FROM customer_sales
//     ORDER BY
//         total_sales ASC,
//         customer ASC
//    -- LIMIT 2
// )

// SELECT
//     wt.customer,
//     wt.customer_name,
//     con.construction_description AS product_construction,
//     ROUND(SUM(s.Invoice_Value_INR), 2) AS construction_wise_sales,
//     ROUND(wt.total_sales, 2) AS total_customer_sales
// FROM worst_two wt
// JOIN sales_data s
//     ON wt.customer = s.customer
// JOIN sku_master sm
//     ON s.material = sm.MATNR
// JOIN construction_master con
//     ON sm.construction = con.construction_code
// GROUP BY
//     wt.customer,
//     wt.customer_name,
//     con.construction_description,
//     wt.total_sales
// ORDER BY
//     wt.total_sales ASC,
//     construction_wise_sales DESC;



// SELECT 
//     COALESCE(cm.`Cname`, 'N/A') AS `customer_name`,
//     sd.`customer` AS `customer_id`,
//     SUM(sd.`Invoice_Value_INR`) AS `total_sales`
// FROM `jk1_3_db`.`sales_data` sd
// LEFT JOIN `jk1_3_db`.`customer_master` cm ON sd.`customer` = cm.`KUNNR`
// GROUP BY sd.`customer`, cm.`Cname`
// ORDER BY `total_sales` DESC
// LIMIT 10;


//  SELECT 
//     COALESCE(`cm`.`Cname`, 'N/A') AS `customer_name`,
//     `sd`.`customer` AS `customer_id`,
//     SUM(`sd`.`Invoice_Value_INR`) AS `total_sales`
// FROM `sales_data` `sd`
// LEFT JOIN `customer_master` `cm` ON `sd`.`customer` = `cm`.`KUNNR`
// GROUP BY `sd`.`customer`, `cm`.`Cname`
// ORDER BY `total_sales` ASC, `sd`.`customer` ASC
// LIMIT 10;