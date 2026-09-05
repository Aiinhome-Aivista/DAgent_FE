import React from 'react';
import toast from 'react-hot-toast';
import { AdminUser } from '../types';
import { UserPlus, X, Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../../services/admin.service';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface MangeUsersProps {
    users: AdminUser[];
    searchQuery: string;
    onRefresh: () => void;
    adminId: number;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

export const MangeUser: React.FC<MangeUsersProps> = ({
    users,
    searchQuery,
    onRefresh,
    adminId,
    isModalOpen,
    setIsModalOpen
}) => {
    const [formData, setFormData] = React.useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await adminService.createUser(adminId, {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            toast.success('User created successfully');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '' });
            onRefresh();
        } catch (err: any) {
            console.error('Failed to create user:', err);
            setError(err.message || 'Failed to create user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);
    const [editFormData, setEditFormData] = React.useState({ name: '', email: '', password: '' });

    const handleOpenEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setEditFormData({
            name: user.name || '',
            email: user.email || '',
            password: user.password || ''
        });
        setIsEditModalOpen(true);
        setError(null);
    };

    const handleEditUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await adminService.editUser(adminId, editingUser.id, editFormData);
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
            onRefresh();
        } catch (err: any) {
            console.error('Failed to edit user:', err);
            setError(err.message || 'Failed to update user.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await adminService.deleteUser(adminId, userId);
                toast.success('User deleted successfully');
                onRefresh();
            } catch (err: any) {
                console.error('Failed to delete user:', err);
                toast.error(err.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="space-y-4">
            <DataTable
                value={filteredUsers}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: '50rem' }}
                emptyMessage={<div className="p-8 text-center text-[var(--text-secondary)]">No users found.</div>}
                className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface)] shadow-sm"
                pt={{
                    thead: { className: 'bg-[var(--bg)]/50' },
                    tbody: { className: 'bg-[var(--surface)]' },
                    bodyRow: { className: 'hover:bg-[var(--surface-hover)] transition-colors' },
                    paginator: {
                        root: { className: '!bg-[var(--surface)] !border-t !border-[var(--border)] !py-3 !px-4 !flex !items-center !justify-center !gap-1' },
                        firstPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
                        prevPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
                        nextPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
                        lastPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
                        pageButton: ({ context }: any) => ({
                            className: `!w-9 !h-9 !rounded-lg !transition-colors !flex !items-center !justify-center text-sm ${
                                context.active 
                                    ? '!bg-[var(--accent)] !text-white !font-semibold' 
                                    : 'hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] hover:!border-[var(--border)] !border !border-transparent'
                            }`
                        }),
                        RPPDropdown: {
                            root: { className: '!bg-[var(--surface)] !border !border-[var(--border)] hover:!border-[var(--accent)] !rounded-lg !px-2 !py-1 text-sm !text-[var(--text-primary)] !flex !items-center !gap-1.5 !cursor-pointer !outline-none !transition-colors' },
                            input: { className: '!px-1 !font-medium' },
                            trigger: { className: '!w-5 !text-[var(--text-secondary)] !flex !items-center !justify-center' },
                            panel: { className: '!bg-[var(--surface)] !border border-[var(--border)] !rounded-lg !shadow-lg !py-1 !mt-1 !z-50' },
                            item: ({ context }: any) => ({
                                className: `!px-4 !py-2 text-sm !cursor-pointer !transition-colors ${
                                    context.selected 
                                        ? '!bg-[var(--accent)] !text-white !font-semibold' 
                                        : 'hover:!bg-[var(--surface-hover)] !text-[var(--text-primary)]'
                                }`
                            })
                        }
                    }
                }}
            >
                <Column 
                    header="SL" 
                    headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
                    className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
                    style={{ width: '10%' }}
                    body={(user: AdminUser, options: any) => options.rowIndex + 1}
                />
                <Column 
                    field="name" 
                    header="Name" 
                    headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
                    className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-primary)] font-medium"
                    style={{ width: '30%' }}
                />
                <Column 
                    field="email" 
                    header="Email" 
                    headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
                    className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)]"
                    style={{ width: '35%' }}
                />
                <Column
                    field="created_at"
                    header="Created At"
                    headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
                    className="!px-6 !py-4 !border-b !border-[var(--border)] !text-[var(--text-secondary)] text-xs"
                    style={{ width: '25%' }}
                    body={(user: AdminUser) => {
                        if (!user.created_at) return '-';
                        const date = new Date(user.created_at);
                        const d = String(date.getDate()).padStart(2, '0');
                        const m = String(date.getMonth() + 1).padStart(2, '0');
                        const y = String(date.getFullYear()).slice(-2);
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${d}/${m}/${y} ${hours}:${minutes}`;
                    }}
                />
                <Column 
                    field="workspaces" 
                    header="Workspaces" 
                    headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
                    className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)]"
                    style={{ width: '20%' }}
                    body={(user: AdminUser) => (
                        <div className="flex flex-wrap gap-1">
                            {user.workspaces ? user.workspaces.split(',').map((ws, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
                                    {ws.trim()}
                                </span>
                            )) : <span className="text-[var(--text-secondary)] text-xs italic">None</span>}
                        </div>
                    )}
                />
                <Column
                    header="Actions"
                    headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-center"
                    className="!px-6 !py-4 !border-b !border-[var(--border)] text-center"
                    style={{ width: '10%' }}
                    body={(user: AdminUser) => (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                                title="Edit User"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Delete User"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    )}
                />
            </DataTable>

            {/* Edit User Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-[var(--accent)]" />
                                Edit User
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-2">
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">User Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type="text"
                                            required
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            placeholder="Enter full name"
                                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type="email"
                                            required
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            placeholder="Enter email address"
                                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={editFormData.password}
                                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                            placeholder="Enter password"
                                            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                        Password is securely encrypted in the database.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-2.5 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserIcon className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-[var(--accent)]" />
                                Create New User
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-2">
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">User Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter full name"
                                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter email address"
                                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Enter password"
                                            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-2.5 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
