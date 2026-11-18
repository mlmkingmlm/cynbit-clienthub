
import { useEffect, useState } from "react";
import {
    Plus,
    FolderKanban,
    Clock,
    CheckCircle,
    X,
    LoaderCircle,
    Menu
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        clientId: "",
        startDate: "",
        deadline: ""
    });

    const fetchDashboard = async () => {
        try {
            setLoading(true);

            const [projectRes, clientRes] = await Promise.all([
                API.get("/projects"),
                API.get("/auth/clients")
            ]);

            setProjects(projectRes.data.projects);
            setClients(clientRes.data.clients);

        } catch (err) {
            setError(err.response?.data?.message || "Unable to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await API.post("/projects", {
                ...form,
                milestones: []
            });

            setForm({
                name: "",
                description: "",
                clientId: "",
                startDate: "",
                deadline: ""
            });

            setShowForm(false);
            await fetchDashboard();

        } catch (err) {
            setError(err.response?.data?.message || "Project creation failed");
        } finally {
            setSaving(false);
        }
    };

    const stats = [
        {
            label: "Total Projects",
            value: projects.length,
            icon: FolderKanban
        },
        {
            label: "In Progress",
            value: projects.filter(p => p.status === "in-progress").length,
            icon: Clock
        },
        {
            label: "Completed",
            value: projects.filter(p => p.status === "completed").length,
            icon: CheckCircle
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white flex w-full overflow-x-hidden">            <Sidebar
            role="admin"
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />
            <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap justify-between items-center gap-4 mb-8">

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg bg-slate-800 text-white"
                            aria-label="Open menu"
                        >
                            <Menu size={23} />
                        </button>

                        <div>
                            <p className="text-slate-400 text-sm">
                                Workspace / Overview
                            </p>

                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">
                                Welcome, {user.name}
                            </h1>

                            <p className="text-slate-400 mt-1 text-sm">
                                Manage your client projects in one place.
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-3 sm:px-4 py-3 rounded-lg font-semibold text-sm"
                    >
                        <Plus size={19} />
                        New Project
                    </button>


                </header>

                {error && (
                    <div className="mb-5 p-3 rounded-lg bg-red-500/10 text-red-300">
                        {error}
                    </div>
                )}

                {showForm && (
                    <Modal
                        isOpen={showForm}
                        onClose={() => setShowForm(false)}
                        onSuccess={fetchDashboard}
                    />
                )}

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-8">                    {stats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
                        <div className="flex justify-between">
                            <p className="text-slate-400">{label}</p>
                            <Icon className="text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-bold mt-4">{value}</h2>
                    </div>
                ))}
                </section>

                <section className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-700">
                        <h2 className="text-xl font-semibold">Recent Projects</h2>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-slate-400">
                            <LoaderCircle className="animate-spin mx-auto mb-2" />
                            Loading projects...
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            No projects found. Create your first project.
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full min-w-[650px] text-left">
                                <thead className="text-slate-400 text-sm bg-slate-900">
                                    <tr>
                                        <th className="p-4">Project</th>
                                        <th className="p-4">Client</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Progress</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {projects.map(project => (
                                        <tr key={project._id} className="border-t border-slate-700">
                                            <td className="p-4 font-medium">{project.name}</td>
                                            <td className="p-4 text-slate-400">
                                                {project.client?.name}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-cyan-300 text-sm">
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="p-4 min-w-40">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>{project.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-400 rounded-full"
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => navigate(`/admin/projects/${project._id}`)}
                                                    className="text-blue-600 hover:underline cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
};

export default AdminDashboard;
