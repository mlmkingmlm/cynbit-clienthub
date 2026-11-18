
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Clock,
  CheckCircle,
  CalendarDays,
  FileText,
  LoaderCircle
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import API from "../services/api";

const ClientDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/projects");

      setProjects(data.projects);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderKanban
    },
    {
      label: "In Progress",
      value: projects.filter(
        p => p.status === "in-progress"
      ).length,
      icon: Clock
    },
    {
      label: "Completed",
      value: projects.filter(
        p => p.status === "completed"
      ).length,
      icon: CheckCircle
    }
  ];

  const statusStyles = {
    planning: "bg-blue-500/10 text-blue-400",
    "in-progress": "bg-cyan-500/10 text-cyan-400",
    completed: "bg-green-500/10 text-green-400",
    "on-hold": "bg-orange-500/10 text-orange-400"
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex w-full overflow-x-hidden">

      <Sidebar
        role="client"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <header className="flex items-center gap-3 mb-8">

          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg bg-slate-800"
            aria-label="Open menu"
          >
            <FolderKanban size={21}/>
          </button>

          <div>
            <p className="text-sm text-slate-400">
              Workspace / My Projects
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold mt-2">
              Welcome, {user.name}
            </h1>

            <p className="text-slate-400 text-sm mt-1">
              Track your projects and development progress.
            </p>
          </div>

        </header>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 rounded-lg bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">

          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5"
            >
              <div className="flex justify-between">
                <p className="text-slate-400">{label}</p>
                <Icon className="text-cyan-400"/>
              </div>

              <h2 className="text-3xl font-bold mt-4">
                {value}
              </h2>
            </div>
          ))}

        </section>

        {/* Projects */}
        <section>

          <h2 className="text-xl font-semibold mb-5">
            My Projects
          </h2>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <LoaderCircle className="animate-spin mx-auto mb-3"/>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
              <FolderKanban className="mx-auto text-slate-500 mb-3" size={36}/>
              <h3 className="font-semibold text-lg">
                No projects assigned yet
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                Your assigned projects will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              {projects.map(project => (

                <div
                  key={project._id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6"
                >

                  <div className="flex justify-between items-start gap-3">

                    <div>
                      <h3 className="text-lg font-semibold">
                        {project.name}
                      </h3>

                      <p className="text-sm text-slate-400 mt-2">
                        {project.description}
                      </p>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${statusStyles[project.status] || "bg-slate-700 text-slate-300"}`}>
                      {project.status}
                    </span>

                  </div>

                  {/* Progress */}
                  <div className="mt-7">

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">
                        Project Progress
                      </span>

                      <span className="text-cyan-400 font-semibold">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{
                          width: `${project.progress}%`
                        }}
                      />
                    </div>

                  </div>

                  {/* Milestones */}
                  <div className="mt-7">

                    <h4 className="font-medium mb-4">
                      Milestones
                    </h4>

                    {project.milestones?.length ? (
                      <div className="space-y-3">

                        {project.milestones.map(milestone => (
                          <div
                            key={milestone._id}
                            className="flex justify-between items-center gap-3 text-sm"
                          >
                            <span className="text-slate-300">
                              {milestone.title}
                            </span>

                            <span className={
                              milestone.status === "completed"
                                ? "text-green-400"
                                : milestone.status === "in-progress"
                                ? "text-cyan-400"
                                : "text-slate-500"
                            }>
                              {milestone.status}
                            </span>
                          </div>
                        ))}

                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No milestones added yet.
                      </p>
                    )}

                  </div>

                  {/* Deliverables */}
                  <div className="mt-7 pt-5 border-t border-slate-700">

                    <h4 className="font-medium mb-3">
                      Deliverables
                    </h4>

                    {project.deliverables?.length ? (
                      <div className="space-y-2">
                        {project.deliverables.map(item => (
                          <a
                            key={item._id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 break-all"
                          >
                            <FileText size={17}/>
                            {item.title}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No deliverables available yet.
                      </p>
                    )}

                  </div>

                  {/* Deadline */}
                  {project.deadline && (
                    <div className="flex items-center gap-2 mt-6 text-sm text-slate-400">
                      <CalendarDays size={17}/>
                      Deadline: {new Date(project.deadline).toLocaleDateString("en-IN")}
                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
};

export default ClientDashboard;
