"use client"

import { Brain, Scan, Link2, CreditCard, Database, Bell  
} from 'lucide-react';
import { motion } from 'framer-motion'


export function AnimatedRocket() {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="drop-shadow-lg"
    >
      <motion.path
        d="M60 10L70 40H90L72 55L80 85L60 70L40 85L48 55L30 40H50L60 10Z"
        fill="url(#rocketGradient)"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="60"
        cy="45"
        r="8"
        fill="#ffffff"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.path
        d="M55 85L60 95L65 85"
        stroke="#3B82F6"
        strokeWidth="3"
        fill="none"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <defs>
        <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export function AnimatedChart() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.rect
        x="10"
        y="60"
        width="15"
        height="30"
        fill="#10B981"
        rx="2"
        animate={{ height: [30, 40, 30] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      />
      <motion.rect
        x="30"
        y="45"
        width="15"
        height="45"
        fill="#3B82F6"
        rx="2"
        animate={{ height: [45, 55, 45] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.rect
        x="50"
        y="30"
        width="15"
        height="60"
        fill="#8B5CF6"
        rx="2"
        animate={{ height: [60, 70, 60] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
      <motion.rect
        x="70"
        y="20"
        width="15"
        height="70"
        fill="#F59E0B"
        rx="2"
        animate={{ height: [70, 80, 70] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
      />
    </motion.svg>
  )
}

export function AnimatedShield() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.path
        d="M50 10L75 25V50C75 65 62.5 80 50 90C37.5 80 25 65 25 50V25L50 10Z"
        fill="url(#shieldGradient)"
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M40 45L47 52L62 37"
        stroke="#ffffff"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E3B02F" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export function AnimatedUsers() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.circle
        cx="35"
        cy="35"
        r="12"
        fill="#E3B02F"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      />
      <motion.circle
        cx="65"
        cy="35"
        r="12"
        fill="#D97706"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.path
        d="M20 70C20 60 27 55 35 55C43 55 50 60 50 70V75H20V70Z"
        fill="#E3B02F"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.path
        d="M50 70C50 60 57 55 65 55C73 55 80 60 80 70V75H50V70Z"
        fill="#D97706"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
      />
    </motion.svg>
  )
}

export function AnimatedWorkflow() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <motion.circle
        cx="50"
        cy="20"
        r="8"
        fill="#3B82F6"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.circle
        cx="80"
        cy="50"
        r="8"
        fill="#10B981"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.33 }}
      />
      <motion.circle
        cx="50"
        cy="80"
        r="8"
        fill="#8B5CF6"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.66 }}
      />
      <motion.circle
        cx="20"
        cy="50"
        r="8"
        fill="#F59E0B"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 1 }}
      />
      <motion.path
        d="M50 28L72 42M72 58L50 72M50 72L28 58M28 42L50 28"
        stroke="#6B7280"
        strokeWidth="2"
        strokeDasharray="4 4"
        animate={{ strokeDashoffset: [0, 8] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.svg>
  )
}

export function AnimatedClock() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.circle
        cx="50"
        cy="50"
        r="35"
        fill="url(#clockGradient)"
        stroke="#3B82F6"
        strokeWidth="3"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.line
        x1="50"
        y1="50"
        x2="50"
        y2="25"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />
      <motion.line
        x1="50"
        y1="50"
        x2="70"
        y2="50"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />
      <circle cx="50" cy="50" r="3" fill="#ffffff" />
      <defs>
        <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export function AnimatedLightning() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.path
        d="M55 10L30 45H45L40 90L70 55H55L55 10Z"
        fill="url(#lightningGradient)"
        animate={{ 
          opacity: [0.8, 1, 0.8],
          filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeDasharray="8 8"
        animate={{ 
          rotate: [0, 360],
          strokeDashoffset: [0, 16]
        }}
        transition={{ 
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
        }}
        opacity="0.3"
      />
      <defs>
        <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export function ProfessionalWave() {
  return (
    <motion.svg
      width="100%"
      height="200"
      viewBox="0 0 1200 200"
      className="absolute bottom-0 left-0 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#10B981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,100 C300,150 600,50 900,100 C1050,125 1150,75 1200,100 L1200,200 L0,200 Z"
        fill="url(#waveGradient)"
        animate={{
          d: [
            "M0,100 C300,150 600,50 900,100 C1050,125 1150,75 1200,100 L1200,200 L0,200 Z",
            "M0,120 C300,70 600,150 900,80 C1050,55 1150,125 1200,90 L1200,200 L0,200 Z",
            "M0,100 C300,150 600,50 900,100 C1050,125 1150,75 1200,100 L1200,200 L0,200 Z"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  )
}

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-20 left-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-20">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 30 30;360 30 30"
              dur="10s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="30" cy="30" r="8" fill="#10B981" opacity="0.6">
            <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-40 right-20"
        animate={{
          y: [0, 15, 0],
          x: [0, -10, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-15">
          <polygon points="40,10 60,30 40,50 20,30" fill="none" stroke="#8B5CF6" strokeWidth="2">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 40 40;360 40 40"
              dur="15s"
              repeatCount="indefinite"
            />
          </polygon>
          <circle cx="40" cy="40" r="15" fill="#F59E0B" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-1/4"
        animate={{
          y: [0, -25, 0],
          rotate: [0, -10, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      >
        <svg width="50" height="50" viewBox="0 0 50 50" className="opacity-25">
          <rect x="15" y="15" width="20" height="20" fill="none" stroke="#EF4444" strokeWidth="2" rx="5">
            <animate attributeName="stroke-width" values="2;4;2" dur="3s" repeatCount="indefinite" />
          </rect>
          <circle cx="25" cy="25" r="5" fill="#10B981">
            <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>
    </div>
  )
}

export function GeometricPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
      <svg width="100%" height="100%" viewBox="0 0 400 400">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

export function ProfessionalIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Document Icon */}
      <motion.div
        className="absolute top-16 right-16"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 3, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-20">
          <rect x="8" y="6" width="24" height="28" rx="2" fill="none" stroke="#3B82F6" strokeWidth="2"/>
          <line x1="12" y1="14" x2="28" y2="14" stroke="#10B981" strokeWidth="2"/>
          <line x1="12" y1="20" x2="24" y2="20" stroke="#10B981" strokeWidth="2"/>
          <line x1="12" y1="26" x2="20" y2="26" stroke="#10B981" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Floating Chart Icon */}
      <motion.div
        className="absolute bottom-20 left-16"
        animate={{
          y: [0, 12, 0],
          x: [0, 8, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <svg width="45" height="45" viewBox="0 0 45 45" className="opacity-15">
          <rect x="8" y="25" width="6" height="12" fill="#8B5CF6" opacity="0.6"/>
          <rect x="18" y="15" width="6" height="22" fill="#3B82F6" opacity="0.6"/>
          <rect x="28" y="20" width="6" height="17" fill="#10B981" opacity="0.6"/>
          <line x1="5" y1="40" x2="40" y2="40" stroke="#6B7280" strokeWidth="2"/>
          <line x1="5" y1="40" x2="5" y2="10" stroke="#6B7280" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Floating Gear Icon */}
      <motion.div
        className="absolute top-1/3 left-8"
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg width="35" height="35" viewBox="0 0 35 35" className="opacity-10">
          <path d="M17.5 12.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="#F59E0B"/>
          <path d="M17.5 2.5l2.5 5h5l-2.5 7.5 7.5 2.5v5l-7.5 2.5 2.5 7.5h-5l-2.5-5-2.5 5h-5l2.5-7.5L5 25v-5l7.5-2.5L10 10h5l2.5-7.5z" fill="none" stroke="#EF4444" strokeWidth="1.5"/>
        </svg>
      </motion.div>
    </div>
  )
}

export function PulsingOrb({ color = "#3B82F6", size = 40 }: { color?: string; size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{ 
          width: size,
          height: size,
          backgroundColor: color,
          opacity: 0.2
        }}
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ 
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: color,
          opacity: 0.4
        }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.2, 0.4]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      />
      <motion.div
        className="rounded-full"
        style={{ 
          width: size * 0.4,
          height: size * 0.4,
          backgroundColor: color
        }}
        animate={{ 
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6
        }}
      />
    </motion.div>
  )
}

// New AP-specific animated icons
export function AnimatedEmail() {
  return (
    <motion.div className="relative w-16 h-16">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Scan className="w-full h-full text-blue-500" />
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
        animate={{ 
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
    </motion.div>
  )
}

export function AnimatedBrain() {
  return (
    <motion.div className="relative w-16 h-16">
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Brain className="w-full h-full text-purple-500" />
      </motion.div>
      <motion.div
        className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full"
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0
        }}
      />
      <motion.div
        className="absolute top-4 right-3 w-1.5 h-1.5 bg-blue-400 rounded-full"
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute bottom-3 left-4 w-1 h-1 bg-green-400 rounded-full"
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  )
}

export function AnimatedIntegration() {
  return (
    <motion.div className="relative w-16 h-16">
      <motion.div
        animate={{ 
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Link2 className="w-full h-full text-emerald-500" />
      </motion.div>
      <motion.div
        className="absolute inset-0 border-2 border-blue-300 rounded-full"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
    </motion.div>
  )
}

export function AnimatedPayment() {
  return (
    <motion.div className="relative w-16 h-16">
      <motion.div
        animate={{
          y: [0, -2, 0],
          rotateY: [0, 10, 0]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <CreditCard className="w-full h-full text-[#E3B02F]" />
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center"
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </motion.div>
    </motion.div>
  )
}

export function AnimatedDatabase() {
  return (
    <motion.div className="relative w-16 h-16">
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Database className="w-full h-full text-indigo-500" />
      </motion.div>
      <motion.div
        className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full"
        animate={{ 
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0
        }}
      />
      <motion.div
        className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-1 bg-green-400 rounded-full"
        animate={{ 
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-1 bg-purple-400 rounded-full"
        animate={{ 
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  )
}

export function AnimatedNotification() {
  return (
    <motion.div className="relative w-16 h-16">
      <motion.div
        animate={{ 
          rotate: [-10, 10, -10],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Bell className="w-full h-full text-orange-500" />
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, 15, -15, 0]
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        !
      </motion.div>
      <motion.div
        className="absolute inset-0 border-2 border-orange-300 rounded-full"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
    </motion.div>
  )
}

// Add these new icons to your animated-icons.tsx
export function AnimatedContactMail() {
  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
      <motion.rect
        x="15"
        y="20"
        width="50"
        height="40"
        rx="4"
        fill="url(#contactMailGradient)"
        stroke="#3B82F6"
        strokeWidth="2"
        animate={{ strokeDasharray: ["8 4", "4 8", "8 4"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M15 25L40 45L65 25"
        stroke="#ffffff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={{ pathLength: [0, 1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.circle
        cx="40"
        cy="40"
        r="3"
        fill="#ffffff"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
      <defs>
        <linearGradient id="contactMailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export function AnimatedContactPhone() {
  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        rotate: [0, 5, -5, 0],
        scale: [1, 1.02, 1]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.rect
        x="20"
        y="15"
        width="40"
        height="50"
        rx="8"
        fill="url(#contactPhoneGradient)"
        stroke="#8B5CF6"
        strokeWidth="2"
      />
      <motion.rect
        x="30"
        y="20"
        width="20"
        height="2"
        rx="1"
        fill="#ffffff"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="40"
        cy="55"
        r="6"
        fill="#10B981"
        stroke="#ffffff"
        strokeWidth="2"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.path
        d="M36 53L40 57L44 53"
        stroke="#ffffff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <defs>
        <linearGradient id="contactPhoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}


export function AnimatedShieldLock() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        scale: [1, 1.05, 1],
        y: [0, -5, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.path
        d="M50 15L75 30V55C75 70 62.5 85 50 95C37.5 85 25 70 25 55V30L50 15Z"
        fill="url(#shieldLockGradient)"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <motion.rect
        x="40"
        y="45"
        width="20"
        height="25"
        rx="3"
        fill="#ffffff"
        stroke="#1D4ED8"
        strokeWidth="2"
        animate={{
          fill: ["#ffffff", "#f8fafc", "#ffffff"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity
        }}
      />
      <motion.circle
        cx="50"
        cy="55"
        r="2"
        fill="#1D4ED8"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      />
      <defs>
        <linearGradient id="shieldLockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export function AnimatedDataFlow() {
  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.circle
        cx="30"
        cy="30"
        r="8"
        fill="#10B981"
        animate={{
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0
        }}
      />
      <motion.circle
        cx="70"
        cy="30"
        r="8"
        fill="#8B5CF6"
        animate={{
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5
        }}
      />
      <motion.circle
        cx="50"
        cy="70"
        r="8"
        fill="#3B82F6"
        animate={{
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1
        }}
      />
      <motion.path
        d="M30 38L45 48M55 52L70 38M38 52L45 48M45 48L55 52"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          strokeDasharray: ["5 5", "10 10", "5 5"],
          strokeDashoffset: [0, 10, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity
        }}
      />
    </motion.svg>
  )
}