'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import {
  AnimatedPayment,
  AnimatedShield,
  AnimatedUsers
} from './animated-icons';

// New animated contact icons
const AnimatedMail = () => (
  <motion.div
    animate={{ 
      y: [0, -5, 0],
      scale: [1, 1.05, 1]
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
  >
    <Mail className="w-6 h-6 text-white" />
  </motion.div>
);

const AnimatedPhone = () => (
  <motion.div
    animate={{ 
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      duration: 4, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
  >
    <Phone className="w-6 h-6 text-white" />
  </motion.div>
);

const AnimatedMapPin = () => (
  <motion.div
    animate={{ 
      scale: [1, 1.1, 1],
    }}
    transition={{ 
      duration: 2, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
  >
    <MapPin className="w-6 h-6 text-white" />
  </motion.div>
);

const AnimatedClockIcon = () => (
  <motion.div
    animate={{ 
      rotate: [0, 360] 
    }}
    transition={{ 
      duration: 8, 
      repeat: Infinity, 
      ease: "linear" 
    }}
  >
    <Clock className="w-6 h-6 text-white" />
  </motion.div>
);

const contactItems = [
  {
    icon: AnimatedMail,
    title: 'Email Us',
    description: 'Our friendly team is here to help.',
    details: 'apautomationai@gmail.com',
    color: 'from-[#E3B02F] to-amber-600',
    bgColor: 'bg-white/10',
    delay: 0.1
  },
  {
    icon: AnimatedPhone,
    title: 'Call Us',
    description: 'Mon-Fri from 8am to 5pm.',
    details: '',
    color: 'from-[#E3B02F] to-amber-600',
    bgColor: 'bg-white/10',
    delay: 0.2
  },
  {
    icon: AnimatedMapPin,
    title: 'Visit Us',
    description: 'Come say hello at our office.',
    details: 'Las Vegas, Nevada',
    color: 'from-[#E3B02F] to-amber-600',
    bgColor: 'bg-white/10',
    delay: 0.3
  },
  {
    icon: AnimatedClockIcon,
    title: 'Business Hours',
    description: "We're here when you need us.",
    details: 'Monday - Friday: 9:00 - 18:00\nSaturday: 10:00 - 16:00',
    color: 'from-[#E3B02F] to-amber-600',
    bgColor: 'bg-white/10',
    delay: 0.4
  }
];

const features = [
  {
    icon: AnimatedShield,
    title: 'Secure Communication',
    description: 'End-to-end encrypted messages',
    color: 'text-[#E3B02F]'
  },
  {
    icon: AnimatedUsers,
    title: '24/7 Support',
    description: 'Always here to help you',
    color: 'text-[#E3B02F]'
  },
  {
    icon: AnimatedPayment,
    title: 'Quick Response',
    description: 'Typically reply within 2 hours',
    color: 'text-[#E3B02F]'
  }
];

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      {/* Main Contact Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 text-white relative overflow-hidden border border-white/10"
      >
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <MessageCircle className="w-12 h-12 mr-4 text-[#E3B02F]" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold mb-1">Let's start a conversation</h3>
              <p className="text-white/70">
                We're here to answer any questions and create effective solutions.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 gap-6">
        {contactItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: item.delay }}
            whileHover={{ 
              scale: 1.02,
              y: -5
            }}
            className={`${item.bgColor} rounded-xl p-6 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-lg group cursor-pointer`}
          >
            <div className="flex items-start space-x-4">
              <motion.div 
                className={`p-3 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <item.icon />
              </motion.div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-white/70 text-sm mb-2">{item.description}</p>
                <p className="text-white/90 font-medium whitespace-pre-line">{item.details}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 text-white border border-white/10"
      >
        <h4 className="font-bold text-lg mb-4 text-center text-[#E3B02F]">Why Choose Us</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm border border-white/10"
            >
              <div className={`flex justify-center mb-2 ${feature.color}`}>
                <feature.icon />
              </div>
              <h5 className="font-semibold text-sm mb-1 text-white">{feature.title}</h5>
              <p className="text-white/70 text-xs">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}