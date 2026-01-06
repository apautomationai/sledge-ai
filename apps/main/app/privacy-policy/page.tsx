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
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      This Privacy Notice describes how Sledge ("Sledge," "we," "us," or "our") collects, uses, discloses, and safeguards information in connection with your access to and use of the Sledge software-as-a-service platform, websites, applications, integrations, and related services (collectively, the "Services").
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      This Privacy Notice is intended to reflect enterprise SaaS best practices and is modeled on industry-standard privacy disclosures used by leading construction software platforms, while accurately reflecting Sledge's current operations.
                    </p>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center font-['League_Spartan']">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                        Important Notice
                      </h4>
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                        By accessing or using the Services, you acknowledge that you have read and understood this Privacy Notice.
                      </p>
                    </div>
                  </section>

                  {/* Section 1 */}
                  <section id="scope" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      1. Scope
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      This Privacy Notice applies to information collected:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Through the Services and any related websites or applications</li>
                      <li>Through communications between you and Sledge (including support and service communications)</li>
                      <li>Through third-party services and integrations that you authorize</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      This Privacy Notice does not apply to information collected by third parties outside of Sledge's control, except as expressly described herein.
                    </p>
                  </section>

                  {/* Section 2 */}
                  <section id="information-collect" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      2. Information We Collect
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      We collect information in the following categories.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.1 Information You Provide
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You may provide information directly to us, including:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6 list-disc list-inside space-y-2">
                      <li>Contact and account information (such as name, email address, phone number, business name, role)</li>
                      <li>Login and authentication information (stored in hashed or encrypted form)</li>
                      <li>Billing and payment information (processed by third-party payment processors)</li>
                      <li>Business and operational data you upload or submit through the Services (including invoices, documents, files, and related metadata)</li>
                      <li>Communications with Sledge, such as support requests, feedback, or inquiries</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.2 Information Collected Automatically
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      When you access or use the Services, we may automatically collect:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6 list-disc list-inside space-y-2">
                      <li>IP address, device identifiers, and approximate location information</li>
                      <li>Browser type, operating system, and device characteristics</li>
                      <li>Usage data, logs, timestamps, and interaction data</li>
                      <li>Diagnostic, performance, and error data</li>
                      <li>Cookies, local storage, session storage, and similar technologies</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.3 Information from Third-Party Integrations
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      If you choose to connect third-party services to the Services, we may collect and process information made available by those services, including:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Email content, attachments, and metadata from email providers (such as sender, recipient, subject, and timestamps)</li>
                      <li>Accounting and financial data from accounting platforms (such as company profile information, vendors, customers, products/items, accounts, and transaction records)</li>
                      <li>Integration configuration data and synchronization metadata (such as processing start dates, last-read or last-synced timestamps, and integration status)</li>
                      <li>OAuth and connection data necessary to maintain integrations (such as access tokens, refresh tokens, scopes, token expiry, and provider identifiers)</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      We access and process third-party data only as authorized by you through the applicable integration.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      You are responsible for ensuring that you have all necessary rights, permissions, and consents to connect third-party services and to share related data with Sledge, including where such data relates to your employees, contractors, vendors, or other third parties.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      2.4 Onboarding and Configuration Information
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      We may collect and store onboarding and configuration information required to enable the Services, including integration status, setup preferences, and onboarding completion indicators.
                    </p>
                  </section>

                  {/* Section 3 */}
                  <section id="how-we-use" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      3. How We Use Information
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      We use information for legitimate business purposes, including to:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Provide, operate, maintain, and secure the Services</li>
                      <li>Create and manage user accounts and authenticate users</li>
                      <li>Enable, maintain, and manage authorized integrations</li>
                      <li>Process, transform, and analyze data to provide automation features (such as invoice detection, document processing, and accounting synchronization)</li>
                      <li>Process payments and manage billing</li>
                      <li>Communicate with you about the Services, updates, and support matters</li>
                      <li>Improve functionality, performance, and user experience</li>
                      <li>Monitor usage, prevent misuse, and protect the security and integrity of the Services</li>
                      <li>Comply with legal obligations and enforce our agreements</li>
                    </ul>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30 mt-6">
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed font-semibold uppercase">
                        We do not sell personal information.
                      </p>
                    </div>
                  </section>

                  {/* Section 4 */}
                  <section id="roles" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      4. Roles and Responsibilities (Controller and Processor)
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Depending on the context, Sledge may act as either a data controller or a data processor.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      As a controller, Sledge determines the purposes and means of processing information relating to account administration, billing, marketing communications, and operation of the Services.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      As a processor, Sledge processes data on behalf of its customers when customer content is submitted to the Services or accessed through authorized integrations (such as email or accounting systems), in accordance with customer instructions and applicable agreements.
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Customers remain responsible for determining the purposes for which customer content is processed through the Services.
                    </p>
                  </section>

                  {/* Section 5 */}
                  <section id="ai-features" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      5. Automated Processing and AI-Assisted Features
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      The Services rely on automated systems and machine-assisted processing to analyze documents, extract information, and generate structured outputs. These processes may produce derived data such as classifications, metadata, and extracted records.
                    </p>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center font-['League_Spartan']">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                        AI Output Disclaimer
                      </h4>
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                        Automated outputs may contain errors or omissions and are provided to support your workflows. You remain responsible for reviewing and validating outputs before relying on them for business, financial, legal, or accounting purposes.
                      </p>
                    </div>
                  </section>

                  {/* Section 6 */}
                  <section id="sharing" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      6. Sharing and Disclosure of Information
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      We may share information in the following circumstances.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      6.1 Service Providers and Subprocessors
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      We engage trusted third-party service providers (sometimes referred to as "subprocessors") to support our operations. These providers process information on our behalf under contractual confidentiality and security obligations. Depending on your use of the Services, these providers may include:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Hosting, compute, storage, and infrastructure providers</li>
                      <li>Database and platform service providers</li>
                      <li>AI and machine-assisted processing providers</li>
                      <li>Payment processing and billing providers</li>
                      <li>Email, accounting, and productivity service providers you choose to integrate</li>
                      <li>Communications and email delivery providers</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      We share information with service providers only as necessary to provide the Services or enable the integrations you authorize.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      6.2 Business Transfers
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-6">
                      If Sledge is involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of assets, information may be transferred as part of that transaction, subject to applicable confidentiality protections.
                    </p>

                    <h3 className="text-lg font-semibold text-amber-400 font-['League_Spartan'] mb-3">
                      6.3 Legal and Compliance Requirements
                    </h3>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      We may disclose information where required to do so by law, regulation, or legal process, or where we reasonably believe disclosure is necessary to protect the rights, property, or safety of Sledge, our users, or others.
                    </p>
                  </section>

                  {/* Section 7 */}
                  <section id="retention" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      7. Data Retention
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      We retain information for as long as reasonably necessary to:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Provide the Services</li>
                      <li>Fulfill contractual and operational requirements</li>
                      <li>Comply with legal, accounting, or regulatory obligations</li>
                      <li>Resolve disputes and enforce agreements</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Retention periods may vary based on data type, usage, and legal requirements.
                    </p>
                  </section>

                  {/* Section 8 */}
                  <section id="security" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      8. Security
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      We implement administrative, technical, and organizational measures designed to protect information against unauthorized access, loss, misuse, or disclosure. These measures may include access controls, encryption technologies, network security controls, monitoring, and controlled deployment practices.
                    </p>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center font-['League_Spartan']">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                        Security Disclaimer
                      </h4>
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                        No system can be guaranteed to be completely secure, and we cannot guarantee absolute security.
                      </p>
                    </div>
                  </section>

                  {/* Section 9 */}
                  <section id="cookies" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      9. Cookies and Similar Technologies
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      We use cookies and similar technologies (including local storage and session storage) to:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Authenticate users and maintain sessions</li>
                      <li>Enforce access controls and onboarding requirements</li>
                      <li>Store user preferences and temporary state during setup and integrations</li>
                      <li>Analyze usage and improve performance</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      You may control cookies through your browser settings, but disabling cookies may limit certain features of the Services.
                    </p>
                  </section>

                  {/* Section 10 */}
                  <section id="international" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      10. International Data Transfers
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      The Services are operated primarily in the United States. If you access the Services from outside the United States, your information may be transferred to, stored, and processed in jurisdictions that may have different data protection laws than your location.
                    </p>
                  </section>

                  {/* Section 11 */}
                  <section id="customer-responsibilities" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      11. Customer Responsibilities
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      Customers are responsible for:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Ensuring they have appropriate rights, permissions, and consents to provide data to the Services and to authorize integrations</li>
                      <li>Complying with applicable privacy, data protection, and employment laws with respect to data processed through the Services</li>
                      <li>Reviewing and validating outputs generated by the Services before relying on them</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Sledge does not control the content of customer data processed through authorized integrations.
                    </p>
                  </section>

                  {/* Section 12 */}
                  <section id="your-choices" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      12. Your Choices
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      You may:
                    </p>
                    <ul className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4 list-disc list-inside space-y-2">
                      <li>Update certain account information through the Services</li>
                      <li>Disconnect integrations you have authorized</li>
                      <li>Request account deletion, subject to legal and operational requirements</li>
                    </ul>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Certain information may be retained as required by law or for legitimate business purposes.
                    </p>
                  </section>

                  {/* Section 13 */}
                  <section id="childrens-privacy" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      13. Children's Privacy
                    </h2>
                    <div className="bg-zinc-800 rounded-lg p-6 border border-amber-400/30">
                      <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                        The Services are not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
                      </p>
                    </div>
                  </section>

                  {/* Section 14 */}
                  <section id="third-party" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      14. Third-Party Services
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      The Services may contain links to or integrations with third-party services not controlled by Sledge. This Privacy Notice does not apply to those third-party services, and we encourage you to review their privacy practices separately.
                    </p>
                  </section>

                  {/* Section 15 */}
                  <section id="changes" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      15. Changes to This Privacy Notice
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      We may update this Privacy Notice from time to time. Changes will be effective when posted. Your continued use of the Services after changes are posted constitutes acceptance of the updated Privacy Notice.
                    </p>
                  </section>

                  {/* Section 16 */}
                  <section id="supplemental" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      16. Supplemental Notices
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Additional privacy disclosures may apply depending on your jurisdiction or your use of specific features. Any such supplemental notices will be provided separately and will apply only in the relevant context.
                    </p>
                  </section>

                  {/* Section 17 */}
                  <section id="contact" className="scroll-mt-24 mb-10">
                    <h2 className="text-xl font-bold text-white uppercase font-['League_Spartan'] mb-4">
                      17. Contact Us
                    </h2>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-4">
                      If you have questions or concerns about this Privacy Notice or our data practices, please contact:
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed mb-2">
                      <span className="text-white font-semibold">Sledge</span>
                    </p>
                    <p className="text-zinc-300 font-['Inter'] text-base leading-relaxed">
                      Email: <a href="mailto:support@getsledge.com" className="text-amber-400 hover:text-amber-300 transition-colors">support@getsledge.com</a>
                    </p>
                  </section>

                  {/* Disclaimer */}
                  <div className="border-t border-zinc-700 pt-8 mt-8">
                    <p className="text-zinc-500 font-['Inter'] text-sm italic">
                      This Privacy Notice is provided for informational purposes and does not constitute legal advice.
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
