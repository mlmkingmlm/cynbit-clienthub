
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LogOut,
  X
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Sidebar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
       className={`
        fixed inset-y-0 left-0 z-50
        h-screen w-64 shrink-0 overflow-hidden
        bg-[#020617] text-slate-300
        border-r border-slate-800
        transition-transform duration-300
        md:sticky md:top-0 md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
      >

        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-bold text-cyan-400">
            ClientHub<span className="text-white">.</span>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        <p className="text-xs uppercase text-slate-500 mb-4">
          Workspace
        </p>

        <nav className="space-y-2">

          <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
            <LayoutDashboard size={19} />
            Dashboard
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg text-slate-400">
            <FolderKanban size={19} />
            Projects
          </div>

          {role === "admin" && (
            <div className="flex items-center gap-3 p-3 rounded-lg text-slate-400">
              <Users size={19} />
              Clients
            </div>
          )}

        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-3 text-slate-400 hover:text-red-400"
        >
          <LogOut size={19} />
          Logout
        </button>

      </aside>
    </>
  );
};

export default Sidebar;
