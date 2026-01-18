import type { Metadata } from "next";
import {
  Shield,
  FileText,
  Database,
  Info,
  Users,
  Lock,
  Bot,
  Share2,
  Clock,
  Cookie,
  Globe,
  ClipboardList,
  ToggleLeft,
  Baby,
  Link2,
  RefreshCw,
  FileQuestion,
  Mail,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Sledge",
  description:
    "Learn how Sledge collects, uses, discloses, and safeguards your information. Effective Date: January 6, 2026.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const sections = [
  { id: "introduction", title: "Introduction", icon: FileText },
  { id: "scope", title: "Scope", icon: FileText },
  { id: "information-collect", title: "Information We Collect", icon: Database },
  { id: "how-we-use", title: "How We Use Information", icon: Info },
  { id: "roles", title: "Roles & Responsibilities", icon: Users },
  { id: "ai-features", title: "AI-Assisted Features", icon: Bot },
  { id: "sharing", title: "Sharing & Disclosure", icon: Share2 },
  { id: "retention", title: "Data Retention", icon: Clock },
  { id: "security", title: "Security", icon: Lock },
  { id: "cookies", title: "Cookies", icon: Cookie },
  { id: "international", title: "International Transfers", icon: Globe },
  { id: "customer-responsibilities", title: "Customer Responsibilities", icon: ClipboardList },
  { id: "your-choices", title: "Your Choices", icon: ToggleLeft },
  { id: "childrens-privacy", title: "Children's Privacy", icon: Baby },
  { id: "third-party", title: "Third-Party Services", icon: Link2 },
  { id: "changes", title: "Changes", icon: RefreshCw },
  { id: "supplemental", title: "Supplemental Notices", icon: FileQuestion },
  { id: "contact", title: "Contact Us", icon: Mail },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Fixed background image */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/images/gpt4.png')",
            zIndex: -1,
          }}
        />
        {/* Black overlay with opacity */}
        <div
          className="fixed inset-0 bg-black pointer-events-none"
          style={{
            opacity: 0.7,
            zIndex: -1,
          }}
        />

        <div className="relative max-w-7xl mx-auto my-16">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-amber-400">
                <Shield className="w-10 h-10 text-zinc-900" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase font-['League_Spartan']">
              Privacy Notice
            </h1>

            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
              Learn how Sledge collects, uses, discloses, and safeguards your information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-lg p-6 sticky top-8 shadow-[0px_0px_4px_1px_rgba(227,176,47,1.00)] outline outline-1 outline-offset-[-1px] outline-neutral-700">
                <h3 className="font-semibold text-white mb-4 flex items-center uppercase font-['League_Spartan']">
                  <ArrowRight className="w-4 h-4 mr-2 text-amber-400" />
                  Sections
                </h3>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center group text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 border border-transparent hover:translate-x-1"
                      >
                        <IconComponent className="w-4 h-4 mr-2 flex-shrink-0 text-zinc-500 group-hover:text-amber-400" />
                        <span className="text-xs font-medium font-['Inter'] truncate">
                          {section.title}
                        </span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-900 rounded-lg p-8 md:p-12 shadow-[0px_0px_4px_1px_rgba(227,176,47,1.00)] outline outline-1 outline-offset-[-1px] outline-neutral-700">
                <div className="prose prose-invert max-w-none">
                  {/* Effective Date */}
                  <p className="text-amber-400 font-['Inter'] text-sm font-medium mb-8">
                    Effective Date: January 6, 2026
                  </p>

                  {/* Introduction */}
                  <section id="introduction" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Introduction
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      This Privacy Notice explains how Sledge handles your information.
                    </p>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      We'll cover what data we collect, how we use it, and how we keep it safe. This applies to our software platform, websites, apps, and integrations (we call these the "Services").
                    </p>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-6">
                      We follow best practices used by leading enterprise software companies to protect your privacy.
                    </p>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center font-['League_Spartan']">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                        Important Notice
                      </h4>
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        By using our Services, you agree to the terms in this Privacy Notice.
                      </p>
                    </div>
                  </section>

                  {/* Section 1 */}
                  <section id="scope" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      1. What This Policy Covers
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      This policy applies to information we collect from:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-3 ml-4">
                      <li>Our Services, websites, and apps</li>
                      <li>Your communications with us (like support requests)</li>
                      <li>Third-party services you connect to Sledge</li>
                    </ul>
                    <div className="bg-zinc-800/50 rounded-lg p-4 mt-4">
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        <strong className="text-white">Note:</strong> This policy doesn't cover third-party services outside our control.
                      </p>
                    </div>
                  </section>

                  {/* Section 2 */}
                  <section id="information-collect" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      2. Information We Collect
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-6">
                      We collect different types of information to provide and improve our Services.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.1 Information You Give Us
                    </h3>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      When you use Sledge, you may provide:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-6 list-disc space-y-3 ml-6">
                      <li><strong className="text-white">Account details:</strong> Name, email, phone number, business name, and role</li>
                      <li><strong className="text-white">Login credentials:</strong> Stored securely using encryption</li>
                      <li><strong className="text-white">Payment information:</strong> Handled by secure third-party payment processors</li>
                      <li><strong className="text-white">Business documents:</strong> Invoices, files, and related data you upload</li>
                      <li><strong className="text-white">Support messages:</strong> Requests, feedback, and questions you send us</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.2 Information We Collect Automatically
                    </h3>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      When you use our Services, we automatically collect:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-6 list-disc space-y-3 ml-6">
                      <li><strong className="text-white">Device information:</strong> IP address, device type, and approximate location</li>
                      <li><strong className="text-white">Browser details:</strong> Browser type and operating system</li>
                      <li><strong className="text-white">Usage data:</strong> How you interact with our Services</li>
                      <li><strong className="text-white">Performance data:</strong> Logs, errors, and diagnostic information</li>
                      <li><strong className="text-white">Cookies:</strong> Small files stored on your device (see Section 9)</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.3 Information from Connected Services
                    </h3>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      If you connect third-party services (like email or accounting software), we may access:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-4 list-disc space-y-3 ml-6">
                      <li><strong className="text-white">Email data:</strong> Messages, attachments, sender/recipient info, and timestamps</li>
                      <li><strong className="text-white">Accounting data:</strong> Company info, vendors, customers, and transactions</li>
                      <li><strong className="text-white">Sync settings:</strong> Integration status and last sync times</li>
                      <li><strong className="text-white">Connection tokens:</strong> Required to maintain integrations securely</li>
                    </ul>
                    <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-5 mb-4">
                      <p className="text-white font-['Inter'] text-base leading-relaxed mb-3">
                        <strong className="text-white">We only access data you authorize.</strong> You control which services connect to Sledge.
                      </p>
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        <strong className="text-white">Your responsibility:</strong> Make sure you have permission to share data with us, especially if it includes information about employees, contractors, or vendors.
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.4 Setup Information
                    </h3>
                    <p className="text-white font-['Inter'] text-base leading-relaxed">
                      We store your onboarding progress, integration settings, and preferences to make the Services work properly.
                    </p>
                  </section>

                  {/* Section 3 */}
                  <section id="how-we-use" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      3. How We Use Your Information
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      We use your information to:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">Run the Services</h4>
                        <ul className="text-white font-['Inter'] text-sm leading-relaxed space-y-1.5">
                          <li>• Keep your account running</li>
                          <li>• Manage logins and security</li>
                          <li>• Connect your integrations</li>
                        </ul>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">Provide Features</h4>
                        <ul className="text-white font-['Inter'] text-sm leading-relaxed space-y-1.5">
                          <li>• Process invoices and documents</li>
                          <li>• Sync with accounting software</li>
                          <li>• Automate workflows</li>
                        </ul>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">Handle Billing</h4>
                        <ul className="text-white font-['Inter'] text-sm leading-relaxed space-y-1.5">
                          <li>• Process payments</li>
                          <li>• Send invoices</li>
                          <li>• Manage subscriptions</li>
                        </ul>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">Improve & Protect</h4>
                        <ul className="text-white font-['Inter'] text-sm leading-relaxed space-y-1.5">
                          <li>• Make the Services better</li>
                          <li>• Fix bugs and issues</li>
                          <li>• Prevent misuse</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-6">
                      We also use information to communicate with you about updates, answer support questions, and meet legal requirements.
                    </p>
                    <div className="bg-green-900/20 border-2 border-green-400/40 rounded-lg p-6">
                      <p className="text-white font-['Inter'] text-lg leading-relaxed font-bold text-center">
                        We never sell your personal information.
                      </p>
                    </div>
                  </section>

                  {/* Section 4 */}
                  <section id="roles" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      4. Our Role with Your Data
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-6">
                      Sledge plays different roles depending on the type of data:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-zinc-800/50 rounded-lg p-5 border-l-4 border-amber-400">
                        <h4 className="text-white font-semibold mb-2 font-['Inter'] text-lg">When We Control Data</h4>
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          For account management, billing, and Service operations, we decide how to handle your information.
                        </p>
                      </div>

                      <div className="bg-zinc-800/50 rounded-lg p-5 border-l-4 border-blue-400">
                        <h4 className="text-white font-semibold mb-2 font-['Inter'] text-lg">When We Process for You</h4>
                        <p className="text-white font-['Inter'] text-base leading-relaxed mb-3">
                          For data you upload or connect (like emails and accounting data), we process it on your behalf based on your instructions.
                        </p>
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          <strong className="text-white">You're in charge:</strong> You determine how your business data is used through the Services.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 5 */}
                  <section id="ai-features" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      5. AI and Automation
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      Sledge uses AI and automated systems to:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-6 list-disc space-y-2 ml-6">
                      <li>Analyze your documents</li>
                      <li>Extract information from invoices and files</li>
                      <li>Generate organized records</li>
                      <li>Classify and categorize data</li>
                    </ul>
                    <div className="bg-amber-900/20 border-2 border-amber-400/40 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-3 flex items-center font-['League_Spartan'] text-lg">
                        <AlertTriangle className="w-6 h-6 mr-2 text-amber-400" />
                        Important: Review AI Outputs
                      </h4>
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        AI can make mistakes. Always review and verify automated results before using them for business, financial, or legal decisions.
                      </p>
                    </div>
                  </section>

                  {/* Section 6 */}
                  <section id="sharing" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      6. When We Share Information
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-6">
                      We only share your information in specific situations:
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      6.1 Trusted Service Partners
                    </h3>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      We work with trusted companies that help us run the Services. They must follow strict security and privacy rules.
                    </p>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-3">
                      These partners may include:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-6 list-disc space-y-2 ml-6">
                      <li>Cloud hosting and storage providers</li>
                      <li>Database services</li>
                      <li>AI processing providers</li>
                      <li>Payment processors</li>
                      <li>Email delivery services</li>
                      <li>Integration partners you authorize (email, accounting software, etc.)</li>
                    </ul>
                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        We only share what's necessary to provide the Services you use.
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      6.2 Business Changes
                    </h3>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-6">
                      If Sledge merges with another company or is acquired, your information may be transferred. It will remain protected under privacy agreements.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      6.3 Legal Requirements
                    </h3>
                    <p className="text-white font-['Inter'] text-base leading-relaxed">
                      We may share information when required by law or to protect the safety and rights of Sledge, our users, or others.
                    </p>
                  </section>

                  {/* Section 7 */}
                  <section id="retention" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      7. How Long We Keep Your Data
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      We keep your information as long as needed to:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-4 list-disc space-y-2 ml-6">
                      <li>Run your account and provide Services</li>
                      <li>Meet our contract with you</li>
                      <li>Follow legal and tax requirements</li>
                      <li>Resolve any disputes</li>
                    </ul>
                    <p className="text-white font-['Inter'] text-base leading-relaxed">
                      The exact time varies depending on the type of data and legal requirements. Some data may need to be kept longer for accounting or legal reasons.
                    </p>
                  </section>

                  {/* Section 8 */}
                  <section id="security" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      8. How We Protect Your Data
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      We use multiple security measures to protect your information:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          <strong className="text-white">🔒 Encryption:</strong> Your data is encrypted in transit and at rest
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          <strong className="text-white">🔐 Access Controls:</strong> Limited access to authorized personnel only
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          <strong className="text-white">🛡️ Network Security:</strong> Firewalls and monitoring systems
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          <strong className="text-white">👁️ Monitoring:</strong> Continuous security monitoring
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-5">
                      <h4 className="font-semibold text-white mb-2 flex items-center font-['Inter']">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                        Please Note
                      </h4>
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        While we use industry-standard security practices, no online system is 100% secure. We work hard to protect your data but cannot guarantee absolute security.
                      </p>
                    </div>
                  </section>

                  {/* Section 9 */}
                  <section id="cookies" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      9. Cookies and Tracking
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      We use cookies (small files stored on your device) to:
                    </p>
                    <ul className="text-white font-['Inter'] text-base leading-relaxed mb-4 list-disc space-y-2 ml-6">
                      <li>Keep you logged in</li>
                      <li>Remember your preferences</li>
                      <li>Maintain security</li>
                      <li>Understand how you use the Services</li>
                      <li>Improve performance</li>
                    </ul>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        <strong className="text-white">You can control cookies</strong> through your browser settings. However, blocking cookies may prevent some features from working properly.
                      </p>
                    </div>
                  </section>

                  {/* Section 10 */}
                  <section id="international" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      10. International Users
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-3">
                      Our Services are based in the United States.
                    </p>
                    <p className="text-white font-['Inter'] text-base leading-relaxed">
                      If you use Sledge from another country, your information will be transferred to and stored in the U.S. Data protection laws may differ from those in your location.
                    </p>
                  </section>

                  {/* Section 11 */}
                  <section id="customer-responsibilities" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      11. Your Responsibilities
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      As a Sledge user, you're responsible for:
                    </p>
                    <div className="space-y-4 mb-4">
                      <div className="bg-zinc-800/50 rounded-lg p-4 border-l-4 border-amber-400">
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">✓ Getting Permission</h4>
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          Make sure you have the right to share data with Sledge, especially if it includes employee, contractor, or vendor information.
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4 border-l-4 border-amber-400">
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">✓ Following Laws</h4>
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          Comply with privacy and data protection laws that apply to your business.
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4 border-l-4 border-amber-400">
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">✓ Reviewing AI Results</h4>
                        <p className="text-white font-['Inter'] text-base leading-relaxed">
                          Always check automated outputs before using them for important decisions.
                        </p>
                      </div>
                    </div>
                    <p className="text-white font-['Inter'] text-sm leading-relaxed italic">
                      Note: We don't control the content you upload or connect through integrations - you do.
                    </p>
                  </section>

                  {/* Section 12 */}
                  <section id="your-choices" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      12. Your Privacy Rights
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      You have control over your information. You can:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">✏️</div>
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">Update Info</h4>
                        <p className="text-white font-['Inter'] text-sm leading-relaxed">
                          Change your account details anytime
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🔌</div>
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">Disconnect</h4>
                        <p className="text-white font-['Inter'] text-sm leading-relaxed">
                          Remove integrations you've connected
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🗑️</div>
                        <h4 className="text-white font-semibold mb-2 font-['Inter']">Delete Account</h4>
                        <p className="text-white font-['Inter'] text-sm leading-relaxed">
                          Request deletion of your data
                        </p>
                      </div>
                    </div>
                    <p className="text-white font-['Inter'] text-sm leading-relaxed italic">
                      Some data may be kept longer if required by law or for legitimate business needs.
                    </p>
                  </section>

                  {/* Section 13 */}
                  <section id="childrens-privacy" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      13. Children's Privacy
                    </h2>
                    <div className="bg-red-900/20 border-2 border-red-400/40 rounded-lg p-6">
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        <strong className="text-white">Age restriction:</strong> Sledge is for business use only. Our Services are not intended for anyone under 18 years old. We don't knowingly collect information from children.
                      </p>
                    </div>
                  </section>

                  {/* Section 14 */}
                  <section id="third-party" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      14. Third-Party Services
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-3">
                      Sledge may link to or integrate with other services (like email providers or accounting software).
                    </p>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        <strong className="text-white">Important:</strong> We don't control these third-party services. They have their own privacy policies. Please review them separately.
                      </p>
                    </div>
                  </section>

                  {/* Section 15 */}
                  <section id="changes" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      15. Policy Updates
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-3">
                      We may update this Privacy Notice occasionally to reflect changes in our practices or legal requirements.
                    </p>
                    <p className="text-white font-['Inter'] text-base leading-relaxed">
                      When we make changes, we'll post the updated version here. By continuing to use Sledge after updates, you accept the new terms.
                    </p>
                  </section>

                  {/* Section 16 */}
                  <section id="supplemental" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      16. Additional Disclosures
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed">
                      Depending on where you live or which features you use, additional privacy terms may apply. We'll provide those separately when relevant.
                    </p>
                  </section>

                  {/* Section 17 */}
                  <section id="contact" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      17. Questions?
                    </h2>
                    <p className="text-white font-['Inter'] text-base leading-relaxed mb-4">
                      If you have questions about this Privacy Notice or how we handle your data, we're here to help.
                    </p>
                    <div className="bg-zinc-800/50 rounded-lg p-6 border-l-4 border-amber-400">
                      <p className="text-white font-['Inter'] text-base leading-relaxed mb-3">
                        <span className="text-white font-semibold text-lg">Contact Sledge</span>
                      </p>
                      <p className="text-white font-['Inter'] text-base leading-relaxed">
                        Email: <a href="mailto:support@getsledge.com" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold underline">support@getsledge.com</a>
                      </p>
                    </div>
                  </section>

                  {/* Disclaimer */}
                  <div className="border-t-2 border-zinc-700 pt-8 mt-8">
                    <p className="text-zinc-400 font-['Inter'] text-sm italic leading-relaxed">
                      This Privacy Notice is for informational purposes only and does not constitute legal advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
