import {
  Scale,
  FileText,
  UserCheck,
  Shield,
  AlertTriangle,
  Users,
  Globe,
  Lock,
  Database,
  Mail,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Bot,
  Link2,
  Clock,
  Server,
  Zap,
  Lightbulb,
  MessageSquare,
  Eye,
  Download,
  Gavel,
  Ban,
  FileCheck,
  Settings,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

const sections = [
  { id: "introduction", title: "Introduction", icon: FileText },
  { id: "acceptance", title: "Acceptance of Terms", icon: FileCheck },
  { id: "eligibility", title: "Eligibility & Authority", icon: UserCheck },
  { id: "account", title: "Account Registration", icon: Lock },
  { id: "use", title: "Use of Services", icon: Settings },
  { id: "customer-data", title: "Customer Data", icon: Database },
  { id: "ai-processing", title: "AI Processing", icon: Bot },
  { id: "third-party", title: "Third-Party Services", icon: Link2 },
  { id: "free-trials", title: "Free Trials", icon: Zap },
  { id: "fees", title: "Fees & Billing", icon: CreditCard },
  { id: "refunds", title: "Refund Policy", icon: RefreshCw },
  { id: "data-backup", title: "Data Backup", icon: Download },
  { id: "security", title: "Security", icon: Shield },
  { id: "availability", title: "Availability", icon: Server },
  { id: "beta", title: "Beta Features", icon: Lightbulb },
  { id: "ip", title: "Intellectual Property", icon: FileText },
  { id: "feedback", title: "Feedback", icon: MessageSquare },
  { id: "confidentiality", title: "Confidentiality", icon: Eye },
  { id: "privacy", title: "Privacy", icon: Lock },
  { id: "export", title: "Export Controls", icon: Globe },
  { id: "government", title: "Government Users", icon: Users },
  { id: "termination", title: "Termination", icon: Ban },
  { id: "disclaimers", title: "Disclaimers", icon: AlertTriangle },
  { id: "liability", title: "Limitation of Liability", icon: Scale },
  { id: "indemnification", title: "Indemnification", icon: Shield },
  { id: "disputes", title: "Dispute Resolution", icon: Gavel },
  { id: "governing-law", title: "Governing Law", icon: Globe },
  { id: "general", title: "General Provisions", icon: FileText },
  { id: "contact", title: "Contact Us", icon: Mail },
];

export default function TermsOfService() {
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
                <Scale className="w-10 h-10 text-zinc-900" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase font-['League_Spartan']">
              Terms of Service
            </h1>

            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
              Please read these terms carefully before using Sledge's platform and services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-lg p-6 sticky top-8 shadow-[0px_0px_4px_1px_rgba(227,176,47,1.00)] outline outline-1 outline-offset-[-1px] outline-neutral-700 max-h-[80vh] overflow-y-auto">
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
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      These Terms of Service ("Terms") govern your access to and use of the Sledge software-as-a-service platform, websites, applications, integrations, APIs, and related services (collectively, the "Services").
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      The Services are operated by DMR Corp, a Nevada corporation, doing business as Sledge ("Sledge," "we," "us," or "our").
                    </p>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center font-['League_Spartan']">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                        Important Notice
                      </h4>
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                        By accessing or using the Services, creating an account, or clicking "I agree," you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must not access or use the Services.
                      </p>
                    </div>
                  </section>

                  {/* Acceptance of Terms */}
                  <section id="acceptance" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Acceptance of the Terms
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      These Terms constitute a legally binding agreement between you and Sledge.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      If you access or use the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization, and all references to "you" refer to that organization.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Your continued use of the Services constitutes acceptance of any updated Terms.
                    </p>
                  </section>

                  {/* Eligibility and Authority */}
                  <section id="eligibility" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Eligibility and Authority
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You must be at least 18 years old to use the Services.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      The Services are intended for business and commercial use, not personal consumer use.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You represent that:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>You are legally permitted to enter into this agreement</li>
                      <li>Your use complies with applicable laws and regulations</li>
                      <li>You are not prohibited from using the Services under export control or sanctions laws</li>
                    </ul>
                  </section>

                  {/* Account Registration and Security */}
                  <section id="account" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Account Registration and Security
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      To access certain features, you must register an account and provide accurate, complete, and current information.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You are responsible for:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Maintaining the confidentiality of login credentials</li>
                      <li>Restricting access to your account</li>
                      <li>All activity occurring under your account</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Sledge is not responsible for unauthorized access resulting from your failure to protect credentials. You agree to notify Sledge promptly of any suspected security breach.
                    </p>
                  </section>

                  {/* Use of the Services */}
                  <section id="use" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Use of the Services
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      Subject to these Terms, Sledge grants you a limited, revocable, non-exclusive, non-transferable right to access and use the Services solely for your internal business purposes.
                    </p>
                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      Prohibited Activities
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You may not:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed list-disc list-inside space-y-2">
                      <li>Reverse engineer, decompile, or attempt to derive source code</li>
                      <li>Circumvent security, usage limits, or access controls</li>
                      <li>Interfere with the operation or integrity of the Services</li>
                      <li>Use the Services to develop competing products</li>
                      <li>Use the Services for unlawful, deceptive, or harmful purposes</li>
                    </ul>
                  </section>

                  {/* Customer Data and Content */}
                  <section id="customer-data" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Customer Data and Content
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You retain ownership of all data, documents, files, and materials submitted, uploaded, or processed through the Services ("Customer Content").
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You grant Sledge a limited license to host, store, process, analyze, transmit, and display Customer Content solely to:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Provide the Services</li>
                      <li>Enable authorized integrations</li>
                      <li>Improve system performance and reliability</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      You are solely responsible for the legality, accuracy, and compliance of Customer Content.
                    </p>
                  </section>

                  {/* AI-Assisted and Automated Processing */}
                  <section id="ai-processing" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      AI-Assisted and Automated Processing
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      The Services rely on automated systems, machine learning, and AI-assisted processing to extract, classify, and transform data.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You acknowledge and agree that:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Outputs may be inaccurate, incomplete, or outdated</li>
                      <li>Outputs are not professional advice of any kind</li>
                      <li>You must independently review and validate outputs</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Sledge does not guarantee the accuracy, completeness, or suitability of automated results.
                    </p>
                  </section>

                  {/* Third-Party Services and Integrations */}
                  <section id="third-party" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Third-Party Services and Integrations
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      The Services may integrate with third-party platforms (including email, accounting, payment, and AI services).
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You authorize Sledge to access and process third-party data solely to provide the integrations you enable. Third-party services are governed by their own terms and policies.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Sledge does not control and is not responsible for third-party services, including their availability, data handling, or changes.
                    </p>
                  </section>

                  {/* Free Trials */}
                  <section id="free-trials" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Free Trials
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Sledge may offer free trials at its discretion.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Free trials:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Are provided as-is</li>
                      <li>May be modified or terminated at any time</li>
                      <li>May convert to paid subscriptions automatically unless canceled</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      No guarantees are provided during trial periods.
                    </p>
                  </section>

                  {/* Fees, Billing, and Payments */}
                  <section id="fees" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Fees, Billing, and Payments
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You agree to pay all applicable fees in accordance with your selected plan.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Fees are billed in advance unless otherwise stated. All fees are non-refundable except where required by law. Taxes are your responsibility.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Failure to pay may result in suspension or termination.
                    </p>
                  </section>

                  {/* Refund Policy */}
                  <section id="refunds" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Refund Policy
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      All payments are final.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Sledge does not offer refunds, credits, or prorated charges for unused time, downgrades, or terminated accounts, except where required by law.
                    </p>
                  </section>

                  {/* Data Backup and Customer Responsibilities */}
                  <section id="data-backup" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Data Backup and Customer Responsibilities
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      The Services are not intended to function as your sole system of record.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You are responsible for:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Maintaining independent backups</li>
                      <li>Retaining original source documents</li>
                      <li>Verifying processed data</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Sledge is not liable for data loss except where caused by willful misconduct.
                    </p>
                  </section>

                  {/* Security Measures */}
                  <section id="security" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Security Measures
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Sledge implements reasonable administrative, technical, and organizational safeguards designed to protect data.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      However, no system is completely secure, and Sledge cannot guarantee absolute security.
                    </p>
                  </section>

                  {/* Availability and No SLA */}
                  <section id="availability" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Availability and No SLA
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      The Services are provided as available.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Sledge does not guarantee uptime, uninterrupted service, or error-free operation unless expressly agreed in writing.
                    </p>
                  </section>

                  {/* Beta and Experimental Features */}
                  <section id="beta" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Beta and Experimental Features
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Certain features may be labeled beta, preview, or experimental.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      These features:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed list-disc list-inside space-y-2">
                      <li>May change or be discontinued</li>
                      <li>Are excluded from warranties</li>
                      <li>Are used at your own risk</li>
                    </ul>
                  </section>

                  {/* Intellectual Property */}
                  <section id="ip" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Intellectual Property
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      The Services, including software, designs, workflows, models, and branding, are owned by Sledge and protected by intellectual property laws.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      No rights are granted except as expressly stated.
                    </p>
                  </section>

                  {/* Feedback */}
                  <section id="feedback" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Feedback
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      You grant Sledge a perpetual, irrevocable, royalty-free right to use any feedback you provide without obligation or compensation.
                    </p>
                  </section>

                  {/* Confidentiality */}
                  <section id="confidentiality" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Confidentiality
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Each party agrees to protect the other's confidential information and to use it solely for purposes related to the Services.
                    </p>
                  </section>

                  {/* Privacy */}
                  <section id="privacy" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Privacy
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Use of the Services is governed by the <a href="/privacy-policy" className="text-amber-400 hover:text-amber-300 transition-colors">Sledge Privacy Notice</a>, incorporated by reference.
                    </p>
                  </section>

                  {/* Export Controls and Sanctions */}
                  <section id="export" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Export Controls and Sanctions
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      You may not use the Services in violation of U.S. export control or sanctions laws.
                    </p>
                  </section>

                  {/* Government Users */}
                  <section id="government" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Government Users
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      The Services are commercial computer software provided with restricted rights.
                    </p>
                  </section>

                  {/* Suspension and Termination */}
                  <section id="termination" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Suspension and Termination
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Sledge may suspend or terminate access immediately if:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>You violate these Terms</li>
                      <li>Your use poses risk to the Services or others</li>
                      <li>Required by law</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      You may terminate at any time, subject to payment obligations.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      Effect of Termination
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Upon termination:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed list-disc list-inside space-y-2">
                      <li>Access ends immediately</li>
                      <li>Outstanding fees remain due</li>
                      <li>Certain provisions survive termination</li>
                    </ul>
                  </section>

                  {/* Disclaimers */}
                  <section id="disclaimers" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Disclaimers
                    </h2>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30">
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed uppercase">
                        THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND.
                      </p>
                    </div>
                  </section>

                  {/* Limitation of Liability */}
                  <section id="liability" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Limitation of Liability
                    </h2>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30 space-y-4">
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed uppercase">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, SLEDGE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
                      </p>
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed uppercase">
                        TOTAL LIABILITY SHALL NOT EXCEED FEES PAID IN THE TWELVE MONTHS PRECEDING THE CLAIM.
                      </p>
                    </div>
                  </section>

                  {/* Indemnification */}
                  <section id="indemnification" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Indemnification
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      You agree to indemnify and hold harmless Sledge from claims arising from your use, data, or violations.
                    </p>
                  </section>

                  {/* Dispute Resolution and Arbitration */}
                  <section id="disputes" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Dispute Resolution and Arbitration
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      Disputes shall be resolved through binding arbitration, except for small claims or injunctive relief related to IP.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      Class Action Waiver
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Disputes must be brought individually. Class actions are waived.
                    </p>
                  </section>

                  {/* Governing Law */}
                  <section id="governing-law" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Governing Law
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Nevada law governs these Terms, without regard to conflict-of-law principles.
                    </p>
                  </section>

                  {/* General Provisions */}
                  <section id="general" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      General Provisions
                    </h2>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      Changes to Terms
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      Sledge may modify these Terms at any time. Continued use constitutes acceptance.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      Assignment
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      You may not assign these Terms without consent. Sledge may assign freely.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      Entire Agreement
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      These Terms constitute the entire agreement regarding the Services.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      Severability and Waiver
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Invalid provisions do not affect enforceability of the remainder. Failure to enforce is not a waiver.
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section id="contact" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      Contact Information
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      If you have questions or concerns about these Terms, please contact:
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-2">
                      <span className="text-white font-semibold">Sledge</span>
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-2">
                      DMR Corp, d/b/a Sledge
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-2">
                      Las Vegas, Nevada, USA
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Email: <a href="mailto:support@getsledge.com" className="text-amber-400 hover:text-amber-300 transition-colors">support@getsledge.com</a>
                    </p>
                  </section>

                  {/* Disclaimer */}
                  <div className="border-t border-zinc-700 pt-8 mt-8">
                    <p className="text-zinc-500 font-['Inter'] text-sm italic">
                      This Terms of Service document is provided for informational purposes and does not constitute legal advice.
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
