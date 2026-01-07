'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <div className="bg-zinc-900 rounded-lg p-6 sm:p-12 shadow-[0px_0px_4px_1px_rgba(227,176,47,1.00)] outline outline-1 outline-offset-[-1px] outline-neutral-700 h-full flex flex-col">
        <div className="flex flex-col justify-start items-center gap-1 mb-6">
          <h2 className="text-amber-400 text-3xl md:text-4xl font-bold font-['League_Spartan'] uppercase">
            Send us a message
          </h2>
          <p className="text-gray-200 text-sm font-normal font-['Inter']">
            We'll get back to you quickly
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col justify-start items-start gap-4 flex-1">
          <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-4">
            <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
              <label
                htmlFor="name"
                className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="self-stretch h-11 px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
              <label
                htmlFor="email"
                className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="self-stretch h-11 px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <label
              htmlFor="subject"
              className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
            >
              Subject
            </label>
            <div className="relative self-stretch">
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full h-11 px-4 py-2 pr-10 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors appearance-none cursor-pointer [&>option]:bg-zinc-800 [&>option]:text-neutral-100 [&>option:checked]:bg-zinc-700 [&>option:hover]:bg-zinc-700"
              >
                <option value="" disabled className="text-neutral-400">Select a topic</option>
                <option value="general">General Question</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing & Account</option>
                <option value="integrations">Integrations (Email, QuickBooks, etc.)</option>
                <option value="sales">Sales & Pricing</option>
                <option value="security">Security, Privacy, or Legal</option>
                <option value="feedback">Feedback or Feature Request</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1 flex-1">
            <label
              htmlFor="message"
              className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="self-stretch flex-1 min-h-[150px] px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors resize-none"
              placeholder="Tell us more about your inquiry..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer self-stretch h-11 px-4 py-2 bg-amber-400 hover:bg-amber-500 rounded text-zinc-900 text-sm font-bold font-['Inter'] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </span>
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-zinc-900 rounded-lg p-8 max-w-md mx-4 text-center shadow-[0px_0px_4px_1px_rgba(227,176,47,1.00)] outline outline-1 outline-offset-[-1px] outline-neutral-700">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-amber-400">
                <Send className="w-8 h-8 text-zinc-900" />
              </div>
            </div>
            <h3 className="text-amber-400 text-2xl font-bold font-['League_Spartan'] uppercase mb-2">
              Message Sent!
            </h3>
            <p className="text-gray-200 text-sm font-normal font-['Inter'] mb-6">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="h-11 px-6 py-2 bg-amber-400 hover:bg-amber-500 rounded text-zinc-900 text-sm font-bold font-['Inter'] uppercase transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
