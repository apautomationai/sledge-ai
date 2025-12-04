"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import confetti from "canvas-confetti";

type Priority = "low" | "medium" | "high" | "critical";

export default function ReportBugPage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("low");;
  const [loading, setLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successState, setSuccessState] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!errorToast) return;
    const t = setTimeout(() => setErrorToast(null), 3000);
    return () => clearTimeout(t);
  }, [errorToast]);

  const resetForm = () => {
    setCategory("");
    setTitle("");
    setDescription("");
    setPriority("");
  };

  const validate = () => {
    if (!category) return "Category is required.";
    if (!title.trim()) return "Bug Title is required.";
    if (!description.trim()) return "Bug Description is required.";
    if (!priority) return "Please select a priority.";
    return null;
  };

  const runConfetti = () => {
    const duration = 1500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 30,
        startVelocity: 40,
        spread: 100,
        ticks: 80,
        origin: { x: Math.random(), y: Math.random() * 0.6 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErrorToast(v);
      return;
    }

    setLoading(true);
    setErrorToast(null);

    try {
      const res = await fetch(`http://localhost:5000/api/v1/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, description, priority, source: "sledge_in_app_reporter" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit bug");

      setSuccessState(true);
      setLoading(false);
      runConfetti();

      setTimeout(() => {
        setSuccessState(false);
        resetForm();
      }, 2500);
    } catch (err: any) {
      console.error("Jira Error:", err);
      setErrorToast("Something went wrong sending this bug. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center">
      {/* Success overlay */}
      {successState && (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${theme === "dark" ? "bg-[#1a1d21]" : "bg-white"}`}>
          <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#D4AF37]"} text-center`}>
            Thank you for your feedback
          </h1>
          <p className={`mt-2 text-lg md:text-xl ${theme === "dark" ? "text-white" : "text-[#D4AF37]"} text-center`}>
            We really appreciate it
          </p>
        </div>
      )}

      {!successState && (
        <div
          className={`
            w-full max-w-xl rounded-lg border-2 border-[#D4AF37] p-6 shadow-lg
            ${theme === "dark" ? "bg-[#1a1d21]" : "bg-white"}
          `}
        >
          <h1 className={`text-center text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Having an Issue with Sledge?
          </h1>

          {errorToast && (
            <div className="mb-3">
              <div className={`bg-red-600/90 px-3 py-1 rounded-md text-sm ${theme === "dark" ? "text-white" : "text-black"}`}>
                {errorToast}
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className={`block font-medium mb-1 text-sm ${theme === "dark" ? "text-white" : "text-black"}`}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-md border border-gray-600 px-2 py-1 text-sm focus:outline-none ${theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"}`}
              >
                <option value="">Select category</option>
                <option value="UI / UX">UI / UX</option>
                <option value="Invoices / AP">Invoices / AP</option>
                <option value="Lien Waivers">Lien Waivers</option>
                <option value="Vendors">Vendors</option>
                <option value="Projects">Projects</option>
                <option value="Integrations / QuickBooks">Integrations / QuickBooks</option>
                <option value="Performance / Speed">Performance / Speed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Bug Title */}
            <div>
              <label className={`block font-medium mb-1 text-sm ${theme === "dark" ? "text-white" : "text-black"}`}>Bug Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Briefly describe the issue…"
                className={`w-full rounded-md border border-gray-600 px-2 py-1 text-sm focus:outline-none ${theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"}`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block font-medium mb-1 text-sm ${theme === "dark" ? "text-white" : "text-black"}`}>Bug Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What went wrong? Steps to reproduce?"
                className={`w-full rounded-md border border-gray-600 px-2 py-1 text-sm focus:outline-none ${theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"}`}
              />
            </div>

            {/* Priority */}
            <div>
              <label className={`block font-medium mb-1 text-sm ${theme === "dark" ? "text-white" : "text-black"}`}>Priority</label>
              <div className={`flex items-center justify-between max-w-xs ${theme === "dark" ? "text-white" : "text-black"}`}>
                {(["low", "medium", "high", "critical"] as Priority[]).map((lvl) => (
                  <label key={lvl} className="flex items-center space-x-1 text-sm">
                    <input
                      type="radio"
                      name="priority"
                      value={lvl}
                      checked={priority === lvl}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="form-radio focus:ring-0"
                    />
                    <span className="capitalize">{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-1">
              <button
                type="submit"
                disabled={loading}
                className={`relative inline-flex items-center justify-center px-6 py-2 rounded-md text-sm font-semibold shadow-lg ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"} bg-gradient-to-b from-[#FFD65A] to-[#D4AF37] text-black`}
              >
                {loading ? "Submitting..." : "Submit Bug"}
                {loading && (
                  <svg className="ml-2 w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" strokeWidth="3" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="rgba(0,0,0,0.6)" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
