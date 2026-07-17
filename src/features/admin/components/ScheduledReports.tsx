import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Trash2, Send, FileText, X, Plus, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { scheduleService, ScheduledReport, Recipient, Workspace } from '../../../services/schedule.service';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ScheduledReportsProps {
    searchQuery: string;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

export const ScheduledReports: React.FC<ScheduledReportsProps> = ({ searchQuery, isModalOpen, setIsModalOpen }) => {
    // State
    const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mockReports = scheduleService.getReportOptions();

    // Form State
    const [selectedRecipientId, setSelectedRecipientId] = useState('');
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
    const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [time, setTime] = useState('09:00');
    const [editId, setEditId] = useState<number | null>(null);
    const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [schedulesRes, recipientsRes, workspacesRes] = await Promise.all([
                scheduleService.getSchedules(),
                scheduleService.getRecipients(),
                scheduleService.getWorkspaces()
            ]);
            if (schedulesRes.status === 'success') setScheduledReports(schedulesRes.data || []);
            if (recipientsRes.status === 'success') setRecipients(recipientsRes.data || []);
            if (workspacesRes.status === 'success') setWorkspaces(workspacesRes.workspaces || workspacesRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSchedules = scheduledReports.filter(s => {
        const email = s.recipient_email || recipients?.find(r => r.id === s.recipient_id)?.email || '';
        const workspaceName = s.workspace_name || workspaces?.find(w => w.id === s.workspace_id)?.name || '';
        return email?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
            workspaceName?.toLowerCase().includes(searchQuery?.toLowerCase() || '');
    });

    const handleToggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecipientId || !selectedWorkspaceId || selectedDays.length === 0 || !time) {
            toast.error('Please fill in recipient, workspace, time, and days');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editId) {
                const res = await scheduleService.updateSchedule(editId, {
                    recipient_id: parseInt(selectedRecipientId),
                    workspace_id: parseInt(selectedWorkspaceId),
                    report_ids: selectedReportIds,
                    days: selectedDays,
                    time
                });

                if (res.status === 'success') {
                    toast.success('Schedule updated successfully');
                    fetchData(); // reload
                    closeModal();
                } else {
                    toast.error(res.message || 'Failed to update schedule');
                }
            } else {
                const res = await scheduleService.addSchedule({
                    recipient_id: parseInt(selectedRecipientId),
                    workspace_id: parseInt(selectedWorkspaceId),
                    report_ids: selectedReportIds,
                    days: selectedDays,
                    time
                });

                if (res.status === 'success') {
                    toast.success('Schedule created successfully');
                    fetchData(); // reload
                    closeModal();
                } else {
                    toast.error(res.message || 'Failed to create schedule');
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${editId ? 'update' : 'create'} schedule`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (schedule: ScheduledReport) => {
        setSelectedRecipientId(schedule.recipient_id.toString());
        setSelectedWorkspaceId(schedule.workspace_id ? schedule.workspace_id.toString() : '');
        setSelectedReportIds(Array.isArray(schedule.report_ids) ? schedule.report_ids : []);
        setSelectedDays(schedule.days);
        setTime(schedule.time || '09:00');
        setEditId(schedule.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRecipientId('');
        setSelectedWorkspaceId('');
        setSelectedReportIds([]);
        setSelectedDays([]);
        setTime('09:00');
        setEditId(null);
        setIsModalOpen(false);
        setIsReportsDropdownOpen(false);
    };

    const handleDeleteSchedule = async (id: number) => {
        try {
            const res = await scheduleService.deleteSchedule(id);
            if (res.status === 'success') {
                setScheduledReports(prev => prev.filter(s => s.id !== id));
                toast.success('Schedule removed');
            } else {
                toast.error(res.message || 'Failed to delete schedule');
            }
        } catch (error) {
            toast.error('Failed to delete schedule');
        }
    };

    const getReportName = (id: string, name?: string) => name || mockReports.find(r => r.id === id)?.name || 'Unknown Report';
    const getRecipientEmail = (id: number, email?: string) => email || recipients.find(r => r.id === id)?.email || 'Unknown Email';
    const getRecipientName = (id: number, name?: string) => name || recipients.find(r => r.id === id)?.name || 'Unknown Name';

    return (
        <div className="space-y-4">
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] bg-[var(--bg)]/50 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <div className="col-span-2">ID</div>
                    <div className="col-span-3">Report</div>
                    <div className="col-span-3">Recipient</div>
                    <div className="col-span-2">Schedule</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-[var(--border)]">
                    {isLoading ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
                    ) : filteredSchedules.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">No data found.</div>
                    ) : (
                        filteredSchedules.map(schedule => (
                            <div key={schedule.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--surface-hover)] transition-colors text-sm">
                                <div className="col-span-2 text-[var(--text-secondary)] font-medium">{schedule.id}</div>
                                <div className="col-span-3 font-medium text-[var(--text-primary)]">
                                    {(schedule.report_ids || []).length > 0
                                        ? schedule.report_ids.map(id => mockReports.find(r => r.id === id)?.name || id).join(', ')
                                        : <span className="text-gray-400 italic">No reports selected</span>}
                                </div>
                                <div className="col-span-3 text-[var(--text-secondary)] flex flex-col justify-center">
                                    <span className="font-medium text-[var(--text-primary)] truncate">{getRecipientName(schedule.recipient_id, schedule.recipient_name)}</span>
                                    <div className="text-xs">
                                        <span className="truncate">{getRecipientEmail(schedule.recipient_id, schedule.recipient_email)}</span>
                                    </div>
                                </div>
                                <div className="col-span-2 text-[var(--text-secondary)] text-xs space-y-1">
                                    <div className="font-medium text-[var(--text-primary)]">
                                        {schedule.time}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {schedule.days.map(day => (
                                            <span key={day} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg)] border border-[var(--border)]">
                                                {day.substring(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-1 justify-end">
                                    <button
                                        onClick={() => handleEditClick(schedule)}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-blue-500 rounded-lg hover:bg-blue-500/10 transition-colors"
                                        title="Edit Schedule"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                                        title="Delete Schedule"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Schedule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[var(--accent)]" />
                                {editId ? 'Edit Schedule' : 'Create New Schedule'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSchedule} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Select Recipient */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Select Recipient</label>
                                    <select
                                        value={selectedRecipientId}
                                        required
                                        onChange={(e) => setSelectedRecipientId(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                    >
                                        <option value="" disabled>Choose a recipient...</option>
                                        {recipients.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                                        ))}
                                    </select>
                                    {recipients.length === 0 && (
                                        <p className="text-xs text-amber-500 mt-1">Please add recipients in the Report Recipients tab first.</p>
                                    )}
                                </div>

                                {/* Select Workspace */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Select Target Workspace</label>
                                    <select
                                        value={selectedWorkspaceId}
                                        required
                                        onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                    >
                                        <option value="" disabled>Choose a workspace...</option>
                                        {workspaces.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                    {workspaces.length === 0 && (
                                        <p className="text-xs text-amber-500 mt-1">No workspaces found.</p>
                                    )}
                                </div>

                                {/* Select Reports */}
                                <div className="space-y-1.5 relative">
                                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Select Reports (Optional)</label>

                                    <div
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] cursor-pointer flex justify-between items-center"
                                        onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)}
                                    >
                                        <span className="truncate">
                                            {!Array.isArray(selectedReportIds) || selectedReportIds.length === 0
                                                ? "Choose reports..."
                                                : `${selectedReportIds.length} report(s) selected`}
                                        </span>
                                        <svg className={`w-4 h-4 transition-transform ${isReportsDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>

                                    {isReportsDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            <div className="p-2 space-y-1">
                                                {mockReports.map(report => (
                                                    <label key={report.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 accent-[var(--accent)] rounded border-[var(--border)]"
                                                            checked={Array.isArray(selectedReportIds) && selectedReportIds.includes(report.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedReportIds(prev => Array.isArray(prev) ? [...prev, report.id] : [report.id]);
                                                                } else {
                                                                    setSelectedReportIds(prev => Array.isArray(prev) ? prev.filter(id => id !== report.id) : []);
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm text-[var(--text-primary)]">{report.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Select Time */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Delivery Time</label>
                                    <input
                                        type="time"
                                        value={time}
                                        required
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                    />
                                </div>

                                {/* Select Days */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Select Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS_OF_WEEK.map(day => {
                                            const isSelected = selectedDays.includes(day);
                                            return (
                                                <button
                                                    type="button"
                                                    key={day}
                                                    onClick={() => handleToggleDay(day)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${isSelected
                                                            ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]'
                                                            : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedDays.length === 0 && (
                                        <p className="text-xs text-rose-500 mt-1">Please select at least one day.</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-2.5 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                    {editId ? 'Update Schedule' : 'Create Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
