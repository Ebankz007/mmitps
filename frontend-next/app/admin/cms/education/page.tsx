"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { adminEducationService } from "@/lib/api/education";
import {
    BookOpen, Plus, Pencil, Trash2, ChevronDown, ChevronRight,
    Upload, Video, FileText, Loader2, CheckCircle2, X, Eye,
    EyeOff, GraduationCap, Users, BarChart3, Clock, Save,
    FolderOpen, Film, FileType
} from "lucide-react";
import clsx from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lesson {
    _id: string;
    title: string;
    content?: string;
    videoUrl?: string;
    pdfUrl?: string;
    duration?: number;
    isFree: boolean;
    order: number;
}

interface Module {
    _id: string;
    title: string;
    description?: string;
    order: number;
    lessons: Lesson[];
}

interface Course {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    category: string;
    level: string;
    tags: string[];
    allowedPlans: any[];
    price: number;
    isPublished: boolean;
    modules: Module[];
    totalDuration: number;
    enrolledCount: number;
    completedCount: number;
    totalLessons: number;
}

const CATEGORIES = ['trading', 'crypto', 'finance', 'mindset', 'security'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmtDuration = (mins: number) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EducationCMSPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'curriculum' | 'stats'>('details');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Form state
    const [form, setForm] = useState({
        title: '', description: '', thumbnail: '', category: 'trading',
        level: 'beginner', tags: '', price: 0
    });

    // Curriculum state
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [addingModule, setAddingModule] = useState(false);
    const [newLesson, setNewLesson] = useState<{ moduleId: string; title: string; duration: string; isFree: boolean } | null>(null);
    const [uploading, setUploading] = useState<string | null>(null); // lessonId or 'thumb'

    const fileInputRef = useRef<HTMLInputElement>(null);
    const lessonFileRef = useRef<HTMLInputElement>(null);
    const thumbRef = useRef<HTMLInputElement>(null);

    // Stats
    const [stats, setStats] = useState<any>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminEducationService.getAllCourses();
            setCourses(data);
        } catch {
            showToast('Failed to load courses', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    // ─── Open Drawer ───────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingCourse(null);
        setForm({ title: '', description: '', thumbnail: '', category: 'trading', level: 'beginner', tags: '', price: 0 });
        setActiveTab('details');
        setStats(null);
        setDrawerOpen(true);
    };

    const openEdit = async (course: Course) => {
        setEditingCourse(course);
        setForm({
            title: course.title, description: course.description,
            thumbnail: course.thumbnail || '', category: course.category,
            level: course.level, tags: (course.tags || []).join(', '), price: course.price || 0
        });
        setActiveTab('details');
        setStats(null);
        setDrawerOpen(true);
    };

    const loadStats = async (courseId: string) => {
        try {
            const s = await adminEducationService.getCourseStats(courseId);
            setStats(s);
        } catch { setStats(null); }
    };

    // ─── Save / Update ─────────────────────────────────────────────────────
    const handleSaveCourse = async () => {
        if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            };
            if (editingCourse) {
                const updated = await adminEducationService.updateCourse(editingCourse._id, payload);
                setCourses(cs => cs.map(c => c._id === editingCourse._id ? { ...c, ...updated } : c));
                setEditingCourse(prev => prev ? { ...prev, ...updated } : null);
            } else {
                const created = await adminEducationService.createCourse(payload);
                setCourses(cs => [created, ...cs]);
                setEditingCourse(created);
                setActiveTab('curriculum');
            }
            showToast(editingCourse ? 'Course updated!' : 'Course created! Now add modules and lessons.');
        } catch {
            showToast('Save failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ─── Publish Toggle ────────────────────────────────────────────────────
    const handleTogglePublish = async (id: string) => {
        try {
            const res = await adminEducationService.togglePublish(id);
            setCourses(cs => cs.map(c => c._id === id ? { ...c, isPublished: res.isPublished } : c));
            if (editingCourse?._id === id) setEditingCourse(prev => prev ? { ...prev, isPublished: res.isPublished } : null);
            showToast(res.isPublished ? 'Course published ✓' : 'Course unpublished');
        } catch { showToast('Toggle failed', 'error'); }
    };

    // ─── Delete ────────────────────────────────────────────────────────────
    const handleDeleteCourse = async (id: string) => {
        if (!confirm('Delete this course and ALL student progress? This cannot be undone.')) return;
        try {
            await adminEducationService.deleteCourse(id);
            setCourses(cs => cs.filter(c => c._id !== id));
            setDrawerOpen(false);
            showToast('Course deleted');
        } catch { showToast('Delete failed', 'error'); }
    };

    // ─── Thumbnail Upload ──────────────────────────────────────────────────
    const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        setUploading('thumb');
        try {
            const result = await adminEducationService.uploadFile(fd);
            setForm(f => ({ ...f, thumbnail: result.url }));
            showToast('Thumbnail uploaded');
        } catch { showToast('Thumbnail upload failed', 'error'); }
        finally { setUploading(null); }
    };

    // ─── Module / Lesson CRUD ──────────────────────────────────────────────
    const handleAddModule = async () => {
        if (!newModuleTitle.trim() || !editingCourse) return;
        setAddingModule(true);
        try {
            const updated = await adminEducationService.addModule(editingCourse._id, {
                title: newModuleTitle, order: editingCourse.modules.length
            });
            setEditingCourse(updated);
            setCourses(cs => cs.map(c => c._id === editingCourse._id ? { ...c, ...updated } : c));
            setNewModuleTitle('');
            showToast('Module added');
        } catch { showToast('Failed to add module', 'error'); }
        finally { setAddingModule(false); }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!editingCourse || !confirm('Delete this module and all its lessons?')) return;
        try {
            const updated = await adminEducationService.deleteModule(editingCourse._id, moduleId);
            setEditingCourse(updated);
            setCourses(cs => cs.map(c => c._id === editingCourse._id ? { ...c, ...updated } : c));
            showToast('Module deleted');
        } catch { showToast('Failed to delete module', 'error'); }
    };

    const handleAddLesson = async () => {
        if (!newLesson || !editingCourse) return;
        try {
            const updated = await adminEducationService.addLesson(editingCourse._id, newLesson.moduleId, {
                title: newLesson.title, duration: parseInt(newLesson.duration) || 0, isFree: newLesson.isFree
            });
            setEditingCourse(updated);
            setCourses(cs => cs.map(c => c._id === editingCourse._id ? { ...c, ...updated } : c));
            setNewLesson(null);
            showToast('Lesson added');
        } catch { showToast('Failed to add lesson', 'error'); }
    };

    const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
        if (!editingCourse || !confirm('Delete this lesson?')) return;
        try {
            const updated = await adminEducationService.deleteLesson(editingCourse._id, moduleId, lessonId);
            setEditingCourse(updated);
            setCourses(cs => cs.map(c => c._id === editingCourse._id ? { ...c, ...updated } : c));
        } catch { showToast('Failed to delete lesson', 'error'); }
    };

    const handleLessonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, courseId: string, moduleId: string, lessonId: string, field: 'videoUrl' | 'pdfUrl') => {
        if (!e.target.files?.[0]) return;
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        setUploading(lessonId);
        try {
            const result = await adminEducationService.uploadFile(fd);
            const updated = await adminEducationService.updateLesson(courseId, moduleId, lessonId, { [field]: result.url });
            setEditingCourse(updated);
            setCourses(cs => cs.map(c => c._id === courseId ? { ...c, ...updated } : c));
            showToast(`${field === 'videoUrl' ? 'Video' : 'PDF'} uploaded`);
        } catch { showToast('Upload failed', 'error'); }
        finally { setUploading(null); }
    };

    const toggleModule = (id: string) => setOpenModules(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen space-y-6 animate-in fade-in duration-500">
            {/* Toast */}
            {toast && (
                <div className={clsx(
                    "fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-bold shadow-2xl backdrop-blur-md border transition-all animate-in slide-in-from-top-2",
                    toast.type === 'success' ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"
                )}>
                    {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#10b981]" />
                        Education CMS
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Create and manage courses, modules, lessons, videos, and PDFs.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#10b981] text-black text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    New Course
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Courses', value: courses.length, icon: BookOpen },
                    { label: 'Published', value: courses.filter(c => c.isPublished).length, icon: Eye },
                    { label: 'Total Enrollments', value: courses.reduce((s, c) => s + (c.enrolledCount || 0), 0), icon: Users },
                    { label: 'Total Lessons', value: courses.reduce((s, c) => s + (c.totalLessons || 0), 0), icon: Film },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white/[0.02] border border-[var(--color-border)] rounded-lg p-4 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#10b981]/10">
                            <Icon className="h-5 w-5 text-[#10b981]" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-[var(--color-text-primary)]">{value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Course Table */}
            {loading ? (
                <div className="flex items-center justify-center py-24 opacity-20">
                    <Loader2 className="h-10 w-10 animate-spin" />
                </div>
            ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-20">
                    <GraduationCap className="h-16 w-16 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No courses yet</p>
                    <p className="text-xs mt-1">Click "New Course" to get started</p>
                </div>
            ) : (
                <div className="rounded-lg border border-[var(--color-border)] overflow-hidden bg-surface">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Course</th>
                                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hidden md:table-cell">Category</th>
                                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hidden lg:table-cell">Modules</th>
                                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hidden lg:table-cell">Enrolled</th>
                                <th className="text-center px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Published</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {courses.map(course => (
                                <tr key={course._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {course.thumbnail ? (
                                                <img src={course.thumbnail} alt={course.title} className="w-10 h-10 rounded-lg object-cover bg-[var(--color-surface-2)] flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                                                    <BookOpen className="h-4 w-4 text-[var(--color-text-muted)]" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-[var(--color-text-primary)] text-sm">{course.title}</p>
                                                <p className="text-[10px] text-[var(--color-text-muted)] capitalize">{course.level}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] capitalize">{course.category}</span>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-[var(--color-text-secondary)] text-xs">
                                        {course.modules?.length || 0} modules · {course.totalLessons || 0} lessons
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3 w-3 text-[var(--color-text-muted)]" />
                                            <span className="text-xs text-[var(--color-text-secondary)]">{course.enrolledCount || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <button onClick={() => handleTogglePublish(course._id)} className={clsx(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                            course.isPublished
                                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]"
                                        )}>
                                            {course.isPublished ? <><Eye className="h-3 w-3" /> Live</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(course)} className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[#10b981] hover:text-black text-[var(--color-text-secondary)] transition-all">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteCourse(course._id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-[var(--color-text-primary)] transition-all">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Course Builder Drawer ── */}
            {drawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="relative w-full max-w-2xl h-full bg-surface border-l border-[var(--color-border)] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-[var(--color-text-primary)]">{editingCourse ? 'Edit Course' : 'New Course'}</h3>
                                {editingCourse && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{editingCourse.slug}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                {editingCourse && (
                                    <button onClick={() => handleTogglePublish(editingCourse._id)} className={clsx(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                        editingCourse.isPublished ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                                    )}>
                                        {editingCourse.isPublished ? <><Eye className="h-3 w-3" /> Live</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                                    </button>
                                )}
                                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 px-6 pt-4 border-b border-[var(--color-border)] flex-shrink-0">
                            {(['details', 'curriculum', 'stats'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        if (tab === 'stats' && editingCourse) loadStats(editingCourse._id);
                                    }}
                                    disabled={tab !== 'details' && !editingCourse}
                                    className={clsx(
                                        "px-4 py-2.5 text-[11px] font-black uppercase tracking-widest capitalize rounded-t-lg transition-all border-b-2 -mb-px",
                                        activeTab === tab ? "border-[#10b981] text-[#10b981]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                                    )}
                                >{tab}</button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">

                            {/* ── Details Tab ── */}
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    {/* Thumbnail */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Thumbnail</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-16 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {form.thumbnail ? <img src={form.thumbnail} alt="thumb" className="w-full h-full object-cover" /> : <BookOpen className="h-6 w-6 text-[var(--color-text-muted)]" />}
                                            </div>
                                            <div>
                                                <input type="file" ref={thumbRef} onChange={handleThumbUpload} className="hidden" accept="image/*" />
                                                <button onClick={() => thumbRef.current?.click()} disabled={uploading === 'thumb'}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] text-xs font-bold transition-all">
                                                    {uploading === 'thumb' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                                    {uploading === 'thumb' ? 'Uploading...' : 'Upload Image'}
                                                </button>
                                                {form.thumbnail && <p className="text-[10px] text-[var(--color-text-muted)] mt-1 truncate max-w-[200px]">{form.thumbnail}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Course Title *</label>
                                        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            placeholder="e.g. Forex Fundamentals Masterclass"
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#10b981]/50 transition-colors" />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Description *</label>
                                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="What will students learn in this course?"
                                            rows={3}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#10b981]/50 transition-colors resize-none" />
                                    </div>

                                    {/* Category & Level */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Category</label>
                                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 capitalize">
                                                {CATEGORIES.map(c => <option key={c} value={c} className="bg-surface capitalize">{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Level</label>
                                            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 capitalize">
                                                {LEVELS.map(l => <option key={l} value={l} className="bg-surface capitalize">{l}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Tags <span className="text-[var(--color-text-muted)]">(comma separated)</span></label>
                                        <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                            placeholder="forex, risk management, price action"
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#10b981]/50 transition-colors" />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Price (USD) <span className="text-[var(--color-text-muted)]">— 0 = Free</span></label>
                                        <input type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-colors" />
                                    </div>

                                    {/* Save Button */}
                                    <button onClick={handleSaveCourse} disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#10b981] text-black text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course & Continue'}
                                    </button>
                                </div>
                            )}

                            {/* ── Curriculum Tab ── */}
                            {activeTab === 'curriculum' && editingCourse && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-[var(--color-text-secondary)]">
                                            {editingCourse.modules.length} module(s) · {editingCourse.modules.reduce((s, m) => s + m.lessons.length, 0)} lesson(s) · {fmtDuration(editingCourse.totalDuration)}
                                        </p>
                                    </div>

                                    {/* Add Module */}
                                    <div className="flex gap-2">
                                        <input
                                            value={newModuleTitle}
                                            onChange={e => setNewModuleTitle(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddModule()}
                                            placeholder="New module title..."
                                            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#10b981]/50 transition-colors"
                                        />
                                        <button onClick={handleAddModule} disabled={addingModule || !newModuleTitle.trim()}
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#10b981]/10 text-[#10b981] text-xs font-black hover:bg-[#10b981] hover:text-black transition-all disabled:opacity-40">
                                            {addingModule ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                            Add Module
                                        </button>
                                    </div>

                                    {/* Module List */}
                                    {editingCourse.modules.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                            <FolderOpen className="h-10 w-10 mb-3" />
                                            <p className="text-xs font-black uppercase tracking-widest">No modules yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {editingCourse.modules.sort((a, b) => a.order - b.order).map((mod, mIdx) => (
                                                <div key={mod._id} className="rounded-lg border border-[var(--color-border)] bg-white/[0.02] overflow-hidden">
                                                    {/* Module Header */}
                                                    <div className="flex items-center justify-between px-4 py-3">
                                                        <button onClick={() => toggleModule(mod._id)} className="flex items-center gap-2 flex-1 text-left">
                                                            {openModules.has(mod._id) ? <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" /> : <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />}
                                                            <span className="text-xs font-black text-[var(--color-text-primary)]">Module {mIdx + 1}: {mod.title}</span>
                                                            <span className="text-[10px] text-[var(--color-text-muted)] ml-auto pr-4">{mod.lessons.length} lessons</span>
                                                        </button>
                                                        <button onClick={() => handleDeleteModule(mod._id)} className="p-1.5 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Lessons */}
                                                    {openModules.has(mod._id) && (
                                                        <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2">
                                                            {mod.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                                                                <div key={lesson._id} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 group">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{lesson.title}</p>
                                                                        <div className="flex items-center gap-3 mt-1">
                                                                            {lesson.duration ? <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]"><Clock className="h-3 w-3" />{fmtDuration(lesson.duration)}</span> : null}
                                                                            {lesson.isFree && <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-black">FREE</span>}
                                                                            {lesson.videoUrl && <span className="flex items-center gap-1 text-[10px] text-brand-400"><Video className="h-3 w-3" /> Video</span>}
                                                                            {lesson.pdfUrl && <span className="flex items-center gap-1 text-[10px] text-amber-400"><FileText className="h-3 w-3" /> PDF</span>}
                                                                        </div>
                                                                    </div>
                                                                    {/* Upload buttons */}
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <label title="Upload Video" className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-[var(--color-text-primary)] cursor-pointer transition-all">
                                                                            <input type="file" className="hidden" accept="video/*"
                                                                                onChange={e => handleLessonFileUpload(e, editingCourse._id, mod._id, lesson._id, 'videoUrl')} />
                                                                            {uploading === lesson._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
                                                                        </label>
                                                                        <label title="Upload PDF" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black cursor-pointer transition-all">
                                                                            <input type="file" className="hidden" accept="application/pdf"
                                                                                onChange={e => handleLessonFileUpload(e, editingCourse._id, mod._id, lesson._id, 'pdfUrl')} />
                                                                            <FileText className="h-3.5 w-3.5" />
                                                                        </label>
                                                                        <button onClick={() => handleDeleteLesson(mod._id, lesson._id)} className="p-1.5 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* Add Lesson Inline */}
                                                            {newLesson?.moduleId === mod._id ? (
                                                                <div className="p-3 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 space-y-3">
                                                                    <input value={newLesson.title} onChange={e => setNewLesson(l => l ? { ...l, title: e.target.value } : l)}
                                                                        placeholder="Lesson title"
                                                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#10b981]/50" />
                                                                    <div className="flex items-center gap-3">
                                                                        <input type="number" min={0} value={newLesson.duration} onChange={e => setNewLesson(l => l ? { ...l, duration: e.target.value } : l)}
                                                                            placeholder="Duration (min)"
                                                                            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#10b981]/50" />
                                                                        <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                                                                            <input type="checkbox" checked={newLesson.isFree} onChange={e => setNewLesson(l => l ? { ...l, isFree: e.target.checked } : l)} />
                                                                            Free preview
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button onClick={handleAddLesson} className="flex-1 px-3 py-2 rounded-lg bg-[#10b981] text-black text-[10px] font-black uppercase tracking-widest">Add</button>
                                                                        <button onClick={() => setNewLesson(null)} className="px-3 py-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-[10px] font-black uppercase">Cancel</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setNewLesson({ moduleId: mod._id, title: '', duration: '', isFree: false })}
                                                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:border-[#10b981]/30 hover:text-[#10b981] transition-all">
                                                                    <Plus className="h-3.5 w-3.5" /> Add Lesson
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Stats Tab ── */}
                            {activeTab === 'stats' && editingCourse && (
                                <div className="space-y-4">
                                    {!stats ? (
                                        <div className="flex items-center justify-center py-16 opacity-20">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: 'Enrolled Students', value: stats.totalEnrolled, icon: Users, color: 'text-brand-400' },
                                                    { label: 'Completions', value: stats.totalCompleted, icon: CheckCircle2, color: 'text-green-400' },
                                                    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: BarChart3, color: 'text-amber-400' },
                                                    { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: Clock, color: 'text-brand-400' },
                                                ].map(({ label, value, icon: Icon, color }) => (
                                                    <div key={label} className="bg-white/[0.02] border border-[var(--color-border)] rounded-lg p-5">
                                                        <Icon className={clsx('h-5 w-5 mb-3', color)} />
                                                        <p className="text-2xl font-black text-[var(--color-text-primary)]">{value}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-1">{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-white/[0.02] border border-[var(--color-border)] rounded-lg p-5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-3">Curriculum Overview</p>
                                                <div className="flex gap-6">
                                                    <div>
                                                        <p className="text-xl font-black text-[var(--color-text-primary)]">{stats.totalModules}</p>
                                                        <p className="text-[10px] text-[var(--color-text-muted)]">Modules</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-[var(--color-text-primary)]">{stats.totalLessons}</p>
                                                        <p className="text-[10px] text-[var(--color-text-muted)]">Lessons</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-[var(--color-text-primary)]">{fmtDuration(editingCourse.totalDuration)}</p>
                                                        <p className="text-[10px] text-[var(--color-text-muted)]">Total Duration</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
