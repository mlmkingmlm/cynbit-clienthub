
import { useState } from "react";
import { X, Plus } from "lucide-react";
import API from "../services/api";

const Modal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    clientId: "",
    startDate: "",
    deadline: ""
  });

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const { data } = await API.get("/auth/clients");
      setClients(data.clients);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  };

  const handleOpen = () => {
    setError("");
    fetchClients();
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
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

      onSuccess();
      onClose();

    } catch (err) {
      setError(err.response?.data?.message || "Project creation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              Create New Project
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Add project details and assign a client.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Project Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Description *
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              rows={3}
              required
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Assign Client *
            </label>

            <select
              name="clientId"
              value={form.clientId}
              onFocus={handleOpen}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400"
            >
              <option value="">
                {loadingClients ? "Loading clients..." : "Select client"}
              </option>

              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Deadline
              </label>

              <input
                type="date"
                name="deadline"
                value={form.deadline}
                min={form.startDate || undefined}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingClients || clients.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 disabled:opacity-50"
            >
              <Plus size={18} />
              {saving ? "Creating..." : "Create Project"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Modal;
