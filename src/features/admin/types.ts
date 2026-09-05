export interface AdminUser {
    id: number;
    name?: string | null;
    email: string;
    password?: string;
    role?: string;
    created_at?: string;
    workspaces?: string;
}

export type AdminTab = 'users' | 'workspaces' | 'assignUsers' | 'workspaceUsers' | 'adminChats' | 'pendingKnowledge' | 'customPrompts' | 'scheduledReports';
