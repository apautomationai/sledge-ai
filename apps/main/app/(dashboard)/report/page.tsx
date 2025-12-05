"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import confetti from "canvas-confetti";

type Priority = "low" | "medium" | "high" | "critical";

export default function ReportBugPage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
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
    setPriority("low");
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
      if (Date.now() < end) requestAnimationFrame(frame);
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
      const res = await fetch(`${process.env.BACKEND_URL}/api/v1/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          description,
          priority,
          source: "sledge_in_app_reporter",
        }),
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
    <div className="flex flex-col max-h-screen w-full bg-[var(--background)] overflow-hidden">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto">
        {successState && (
          <div
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${
              theme === "dark" ? "bg-[#1a1d21]" : "bg-white"
            }`}
          >
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-[#D4AF37]"
              } text-center`}
            >
              Thank you for your feedback
            </h1>
            <p
              className={`mt-2 text-lg md:text-xl ${
                theme === "dark" ? "text-white" : "text-[#D4AF37]"
              } text-center`}
            >
              We really appreciate it
            </p>
          </div>
        )}

        {!successState && (
          <form
            ref={formRef}
            onSubmit={onSubmit}
            className={`flex flex-col w-full max-w-md h-full border-2 border-[#D4AF37] rounded-lg p-4 sm:p-5 shadow-lg gap-3 bg-white dark:bg-[#1a1d21]`}
          >
            <h1
              className={`text-center text-lg sm:text-xl font-semibold mb-2 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Having an Issue with Sledge?
            </h1>

            {errorToast && (
              <div className="mb-2">
                <div
                  className={`bg-red-600/90 px-2 py-1 rounded-md text-sm text-center text-white`}
                >
                  {errorToast}
                </div>
              </div>
            )}

            {/* Category */}
            <div className="flex flex-col">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-md border border-gray-600 px-2 py-1 text-sm focus:outline-none ${
                  theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"
                }`}
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
            <div className="flex flex-col">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                Bug Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Briefly describe the issue…"
                className={`w-full rounded-md border border-gray-600 px-2 py-1 text-sm focus:outline-none ${
                  theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"
                }`}
              />
            </div>

            {/* Bug Description */}
            <div className="flex flex-col flex-1">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                Bug Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What went wrong? Steps to reproduce?"
                className={`w-full flex-1 rounded-md border border-gray-600 px-2 py-1 text-sm focus:outline-none resize-none overflow-auto ${
                  theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"
                }`}
              />
            </div>

            {/* Priority */}
            <div className="flex flex-col">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                Priority
              </label>
              <div className="flex items-center justify-between max-w-xs flex-wrap gap-1">
                {(["low", "medium", "high", "critical"] as Priority[]).map((lvl) => (
                  <label key={lvl} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="priority"
                      value={lvl}
                      checked={priority === lvl}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="form-radio"
                    />
                    <span className="capitalize">{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-auto w-full py-2 rounded-md text-sm font-semibold bg-gradient-to-b from-[#FFD65A] to-[#D4AF37] text-black ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {loading ? "Submitting..." : "Submit Bug"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
