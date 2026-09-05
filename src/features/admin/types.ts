export interface AdminUser {
    id: number;
    name?: string | null;
    email: string;
    password?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
    workspaces?: string;
    visibility?: number;
}

export interface PricingPlan {
    id: number;
    plan_name: string;
    data_storage: string;
    uploads: string;
    insights_queries: string;
    basic_features: string;
    download_allowed: string;
    number_of_users: string;
    custom_kpi: string;
    scheduled_email: string;
    created_at?: string;
    updated_at?: string;
}

export type AdminTab = 'users' | 'workspaces' | 'assignUsers' | 'workspaceUsers' | 'adminChats' | 'pendingKnowledge' | 'customPrompts' | 'scheduledReports' | 'pricing';
