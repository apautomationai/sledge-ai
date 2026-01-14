import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Mail, Building2, Clock, Link2, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/landing/contact-form';

interface ContactCardLink {
  label: string;
  href: string;
}

interface ContactCardData {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  detail?: string;
  href?: string;
  links?: ContactCardLink[];
}

const contactCards: ContactCardData[] = [
  {
    icon: Mail,
    title: 'Support Email',
    subtitle: 'Get a response within 24 hours',
    detail: 'support@getsledge.com',
    href: 'mailto:support@getsledge.com',
  },
  {
    icon: Building2,
    title: 'Company',
    subtitle: 'Las Vegas, Nevada, USA',
    detail: 'Sledge',
  },
  {
    icon: Clock,
    title: 'Support Coverage',
    subtitle: 'Available during business hours',
    detail: 'Monday - Friday; 9am - 5pm',
  },
  {
    icon: Link2,
    title: 'Links',
    subtitle: 'Legal information',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms-conditions' },
    ],
  },
];

function ContactCard({ card }: { card: ContactCardData }) {
  const content = (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 transition-all duration-300 hover:border-zinc-600 h-full">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-zinc-800">
          <card.icon className="w-6 h-6 text-zinc-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-white text-base font-semibold font-['Inter'] mb-1">
            {card.title}
          </h4>
          <p className="text-zinc-400 text-sm font-normal font-['Inter'] mb-2">
            {card.subtitle}
          </p>
          {card.detail && (
            <p className="text-white text-sm font-medium font-['Inter']">
              {card.detail}
            </p>
          )}
          {card.links && (
            <div className="flex flex-col gap-1">
              {card.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-400 text-sm font-medium font-['Inter'] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (card.href) {
    return (
      <Link href={card.href} className="block flex-1 cursor-pointer">
        {content}
      </Link>
    );
  }

  return <div className="flex-1">{content}</div>;
}

export default function ContactPage() {
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

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto my-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase font-['League_Spartan']">
              Contact Sledge
            </h1>
            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
              Need help with onboarding, integrations, invoice processing, or
              billing? Send us a message and we will respond as soon as
              possible.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Contact Form */}
            <div className="h-full">
              <ContactForm />
            </div>

            {/* Right Side - Contact Cards */}
            <div className="flex flex-col gap-4 h-full">
              {contactCards.map((card) => (
                <ContactCard key={card.title} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
