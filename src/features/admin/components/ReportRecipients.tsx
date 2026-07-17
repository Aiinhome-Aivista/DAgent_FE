import React, { useState, useEffect } from 'react';
import { Mail, Trash2, X, Plus, User, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { scheduleService, Recipient } from '../../../services/schedule.service';

interface ReportRecipientsProps {
    searchQuery: string;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

export const ReportRecipients: React.FC<ReportRecipientsProps> = ({ searchQuery, isModalOpen, setIsModalOpen }) => {
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => {
        fetchRecipients();
    }, []);

    const fetchRecipients = async () => {
        setIsLoading(true);
        try {
            const res = await scheduleService.getRecipients();
            if (res.status === 'success') {
                setRecipients(res.data);
            } else {
                toast.error(res.message || 'Failed to fetch recipients');
            }
        } catch (error) {
            toast.error('Failed to load recipients');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRecipients = recipients.filter(r => 
        r.email?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
        r.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    );

    const handleAddRecipient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            toast.error('Please enter a full name');
            return;
        }
        if (!newEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }
        if (!editId && recipients.some(r => r.email === newEmail.trim())) {
            toast.error('This email is already in the list');
            return;
        }
        try {
            if (editId) {
                const res = await scheduleService.updateRecipient(editId, newName.trim(), newEmail.trim());
                if (res.status === 'success') {
                    setRecipients(prev => prev.map(r => r.id === editId ? { ...r, name: newName.trim(), email: newEmail.trim() } : r));
                    toast.success('Recipient updated successfully');
                    closeModal();
                } else {
                    toast.error(res.message || 'Failed to update recipient');
                }
            } else {
                const res = await scheduleService.addRecipient(newName.trim(), newEmail.trim());
                if (res.status === 'success') {
                    setRecipients(prev => [res.data, ...prev]);
                    toast.success('Recipient added successfully');
                    closeModal();
                } else {
                    toast.error(res.message || 'Failed to add recipient');
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${editId ? 'update' : 'add'} recipient`);
        }
    };

    const handleEditClick = (recipient: Recipient) => {
        setNewName(recipient.name);
        setNewEmail(recipient.email);
        setEditId(recipient.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setNewName('');
        setNewEmail('');
        setEditId(null);
        setIsModalOpen(false);
    };

    const handleDeleteRecipient = async (id: number) => {
        try {
            const res = await scheduleService.deleteRecipient(id);
            if (res.status === 'success') {
                setRecipients(prev => prev.filter(r => r.id !== id));
                toast.success('Recipient removed');
            } else {
                toast.error(res.message || 'Failed to delete recipient');
            }
        } catch (error) {
            toast.error('Failed to delete recipient');
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] bg-[var(--bg)]/50 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <div className="col-span-2">ID</div>
                    <div className="col-span-4">Full Name</div>
                    <div className="col-span-4">Email Address</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-[var(--border)]">
                    {isLoading ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
                    ) : filteredRecipients.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">No data found.</div>
                    ) : (
                        filteredRecipients.map(recipient => (
                            <div key={recipient.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--surface-hover)] transition-colors text-sm">
                                <div className="col-span-2 text-[var(--text-secondary)] font-medium">{recipient.id}</div>
                                <div className="col-span-4 font-medium text-[var(--text-primary)]">
                                    {recipient.name}
                                </div>
                                <div className="col-span-4 text-[var(--text-secondary)]">
                                    {recipient.email}
                                </div>
                                <div className="col-span-2 text-right flex justify-end gap-1">
                                    <button 
                                        onClick={() => handleEditClick(recipient)}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-blue-500 rounded-lg hover:bg-blue-500/10 transition-colors inline-flex"
                                        title="Edit Recipient"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRecipient(recipient.id)}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors inline-flex"
                                        title="Remove Recipient"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Recipient Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[var(--accent)]" />
                                {editId ? 'Edit Recipient' : 'Add New Recipient'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddRecipient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
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
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-2.5 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    {editId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {editId ? 'Update Recipient' : 'Add Recipient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
