
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Calendar,
    ExternalLink,
    CheckCircle,
    Clock
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

function AdminProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [milestoneForm, setMilestoneForm] = useState({
        title: "",
        description: "",
        dueDate: ""
    });

    const [deliverableForm, setDeliverableForm] = useState({
        title: "",
        url: ""
    });

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data.project);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load project"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleAddMilestone = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await api.post(`/projects/${id}/milestones`, milestoneForm);

            setMilestoneForm({
                title: "",
                description: "",
                dueDate: ""
            });

            await fetchProject();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to add milestone"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (milestoneId, status) => {
        try {
            await api.patch(
                `/projects/${id}/milestones/${milestoneId}`,
                { status }
            );

            await fetchProject();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to update milestone"
            );
        }
    };

    const handleAddDeliverable = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await api.post(`/projects/${id}/deliverables`, deliverableForm);

            setDeliverableForm({
                title: "",
                url: ""
            });

            await fetchProject();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to add deliverable"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                Loading project...
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8">
                <p className="text-red-600">
                    {error || "Project not found"}
                </p>
                <button
                    onClick={() => navigate("/admin")}
                    className="mt-4 text-blue-600"
                >
                    Back to dashboard
                </button>
            </div>
        );
    }

    const progress = Math.round(
        project.progress ??
        (project.milestones?.length
            ? project.milestones.filter(
                (item) => item.status === "completed"
            ).length / project.milestones.length * 100
            : 0)
    );

    return (
        <div className="flex min-h-screen bg-[#080d1b] text-slate-100">
            <Sidebar role="admin" />

            <main className="min-w-0 flex-1 bg-[#080d1b] p-4 sm:p-6 lg:p-8">
                <button
                    onClick={() => navigate("/admin")}
                    className="mb-6 flex items-center gap-2 text-sm text-light hover:text-blue-600"
                >
                    <ArrowLeft size={18} />
                    Back to dashboard
                </button>

                <div className="mb-6 rounded-xl border border-slate-700 bg-[#111827] p-5 shadow-lg">                    <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-light">
                            {project.name}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {project.description}
                        </p>
                        <p className="mt-3 text-sm text-gray-600">
                            Client: {project.client?.name || "N/A"}``
                        </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                        {project.status}
                    </span>
                </div>

                    <div className="mt-6">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="font-medium text-gray-700">
                                Project progress
                            </span>
                            <span className="font-semibold text-blue-600">
                                {progress}%
                            </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* Milestones */}
                    <section className="rounded-xl border border-slate-700 bg-[#111827] p-5 shadow-lg">                        <h2 className="mb-4 text-lg font-semibold">
                        Project Milestones
                    </h2>

                        <form
                            onSubmit={handleAddMilestone}
                            className="mb-6 space-y-3 rounded-lg border border-slate-700 bg-[#0b1220] p-4"                        >
                            <input
                                required
                                value={milestoneForm.title}
                                onChange={(e) =>
                                    setMilestoneForm({
                                        ...milestoneForm,
                                        title: e.target.value
                                    })
                                }
                                placeholder="Milestone title"
                                className="w-full rounded-lg border border-slate-700 bg-[#080d1b] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />

                            <textarea
                                value={milestoneForm.description}
                                onChange={(e) =>
                                    setMilestoneForm({
                                        ...milestoneForm,
                                        description: e.target.value
                                    })
                                }
                                placeholder="Description"
                                rows="2"
                                className="w-full rounded-lg border border-slate-700 bg-[#080d1b] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />

                            <input
                                type="date"
                                value={milestoneForm.dueDate}
                                onChange={(e) =>
                                    setMilestoneForm({
                                        ...milestoneForm,
                                        dueDate: e.target.value
                                    })
                                }
                                className="w-full rounded-lg border border-slate-700 bg-[#080d1b] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />

                            <button
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Plus size={16} />
                                {saving ? "Saving..." : "Add Milestone"}
                            </button>
                        </form>

                        <div className="space-y-3">
                            {project.milestones?.length ? (
                                project.milestones.map((milestone) => (
                                    <div
                                        key={milestone._id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-medium text-gray-800">
                                                    {milestone.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {milestone.description}
                                                </p>
                                                {milestone.dueDate && (
                                                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                        <Calendar size={14} />
                                                        {new Date(
                                                            milestone.dueDate
                                                        ).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>

                                            <select
                                                value={milestone.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        milestone._id,
                                                        e.target.value
                                                    )
                                                }
                                                className="rounded-lg border px-2 py-1 text-sm capitalize"
                                            >
                                                <option value="pending">
                                                    Pending
                                                </option>
                                                <option value="in-progress">
                                                    In Progress
                                                </option>
                                                <option value="completed">
                                                    Completed
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-5 text-center text-sm text-gray-500">
                                    No milestones added yet.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Deliverables */}
                    <section className="rounded-xl border border-slate-700 bg-[#111827] p-5 shadow-lg">
                        <h2 className="mb-4 text-lg font-semibold">
                            Deliverables
                        </h2>

                        <form
                            onSubmit={handleAddDeliverable}
                            className="mb-6 space-y-3 rounded-lg border border-slate-700 bg-[#0b1220] p-4"                        >
                            <input
                                required
                                value={deliverableForm.title}
                                onChange={(e) =>
                                    setDeliverableForm({
                                        ...deliverableForm,
                                        title: e.target.value
                                    })
                                }
                                placeholder="Deliverable title"
className="w-full rounded-lg border border-slate-700 bg-[#080d1b] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"                            />

                            <input
                                required
                                type="url"
                                value={deliverableForm.url}
                                onChange={(e) =>
                                    setDeliverableForm({
                                        ...deliverableForm,
                                        url: e.target.value
                                    })
                                }
                                placeholder="https://example.com"
className="w-full rounded-lg border border-slate-700 bg-[#080d1b] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"                            />

                            <button
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Plus size={16} />
                                {saving ? "Saving..." : "Add Deliverable"}
                            </button>
                        </form>

                        <div className="space-y-3">
                            {project.deliverables?.length ? (
                                project.deliverables.map((item) => (
                                    <a
                                        key={item._id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 rounded-lg border p-4 hover:border-blue-300"
                                    >
                                        <span className="text-sm font-medium text-gray-800">
                                            {item.title}
                                        </span>
                                        <ExternalLink
                                            size={16}
                                            className="shrink-0 text-blue-600"
                                        />
                                    </a>
                                ))
                            ) : (
                                <p className="py-5 text-center text-sm text-gray-500">
                                    No deliverables added yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default AdminProjectDetails;
