
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ArrowRight } from "lucide-react";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { data } = await API.post("/auth/login", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/client");
      }

    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <LockKeyhole size={28} />
          </div>

          <h1 className="text-3xl font-bold text-white">
            ClientHub
          </h1>

          <p className="text-slate-400 mt-2">
            Sign in to manage your projects
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm text-slate-300">
              Email Address
            </label>

            <div className="relative mt-2">
              <Mail className="absolute left-3 top-3.5 text-slate-500" size={18}/>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white outline-none focus:border-cyan-400"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={18}/>}
          </button>

        </form>

        <p className="text-center text-xs text-slate-500 mt-7">
          Cynbit ClientHub · Project Management Portal
        </p>

      </div>
    </div>
  );
};

export default Login;
