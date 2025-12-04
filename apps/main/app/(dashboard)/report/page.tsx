// app/report-a-bug/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import confetti from "canvas-confetti";

type Priority = "low" | "medium" | "high" | "critical";

export default function ReportBugPage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [loading, setLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successState, setSuccessState] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { setTheme, theme } = useTheme();

  // Hide toast after 3s
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
    // Burst style confetti resembling screenshot density
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
      // Example: pass user headers automatically via same-origin; adapt as needed.
      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Optionally pass user info if you have it in the client
          // "x-user-name": user?.name ?? "",
          // "x-user-email": user?.email ?? "",
          // "x-user-company": user?.company ?? "",
        },
        body: JSON.stringify({
          category,
          title,
          description,
          priority,
          source: "sledge_in_app_reporter",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit bug");
      }

      // success
      setSuccessState(true);
      setLoading(false);
      runConfetti();

      // After 2.5s, hide success and reset form (2-3s per spec)
      setTimeout(() => {
        setSuccessState(false);
        resetForm();
      }, 2500);
    } catch (err: any) {
      console.error("Submit error", err);
      setErrorToast("Something went wrong sending this bug. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Left nav placeholder (keeps nav visible per spec) */}
      
        {/* Keep an indicator of selected item */}
      <div className="text-gray-300"> {/* left nav trimmed for brevity */} </div>
      <div className="absolute bottom-6 left-6 text-gray-400 flex items-center space-x-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm">Report A Bug</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {!successState && (
          <div
            className={`
              w-full max-w-xl rounded-lg border-2 border-[#D4AF37] p-4 shadow-lg
              ${theme === "dark" ? "bg-[#1a1d21]" : "bg-white"}
            `}
          >
            <h1
              className={`text-center text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}
            >
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
                  className={`
                    w-full rounded-md border border-gray-600 px-2 py-1 text-sm
                    focus:outline-none
                    ${theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"}
                  `}
                >
                  <option value="">Select category</option>
                  <option value="ui">UI Issue</option>
                  <option value="data">Data Issue</option>
                  <option value="performance">Performance</option>
                  <option value="billing">Billing</option>
                  <option value="other">Other</option>
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
                  className={`
                    w-full rounded-md border border-gray-600 px-2 py-1 text-sm
                    focus:outline-none
                    ${theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"}
                  `}
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
                  className={`
                    w-full rounded-md border border-gray-600 px-2 py-1 text-sm
                    focus:outline-none
                    ${theme === "dark" ? "text-white bg-[#111417]" : "text-black bg-card"}
                  `}
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
                  className={`
                    relative inline-flex items-center justify-center px-6 py-2 rounded-md text-sm font-semibold
                    shadow-lg
                    ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}
                    bg-gradient-to-b from-[#FFD65A] to-[#D4AF37] text-black
                  `}
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

    </div>
  );
}
