"use client";

import { motion } from "framer-motion";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { FileText, Target, Users, ArrowRight, Eye } from "lucide-react";
import { PulsingOrb, FloatingElements, GeometricPattern } from "@/components/landing/animated-icons";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import Image from "next/image";

export default function AboutPage() {
  const stats = [
    {
      value: "10,000+",
      label: "Invoices Processed",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      value: "98%",
      label: "Accuracy Rate",
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      value: "500+",
      label: "Happy Customers",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 relative overflow-hidden">
        {/* Diamond plate texture - ROUGHER */}
        <div className="absolute inset-0 opacity-[0.1]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px),
                           repeating-linear-gradient(-45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Grunge overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `radial-gradient(ellipse at 30% 40%, transparent 30%, rgba(253, 176, 34, 0.15) 31%, transparent 32%)`,
          backgroundSize: '300px 300px'
        }} />

        {/* Background Elements */}
        <GeometricPattern />
        <FloatingElements />

        {/* Background decorative elements */}
        <div className="absolute top-20 right-10 opacity-10">
          <PulsingOrb color="#FDB022" size={120} />
        </div>
        <div className="absolute bottom-20 left-10 opacity-10">
          <PulsingOrb color="#F59E0B" size={100} />
        </div>

        <section className="py-24 sm:py-32 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left column - Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Badge
                  variant="outline"
                  className="mb-6 px-3 py-1 text-sm font-medium border-yellow-600 bg-yellow-500/20 text-yellow-400 uppercase"
                >
                  About SLEDGE
                </Badge>

                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6 uppercase">
                  Why We Built{" "}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    SLEDGE
                  </span>
                </h2>

                <p className="text-xl text-gray-300 mb-6 leading-8">
                  We've all been there — chasing down invoices, juggling emails, and
                  trying to keep projects moving while paperwork slows everything
                  down. In construction and small business especially, missed
                  invoices or late payments can kill cash flow and damage
                  relationships. We built SLEDGE because we were tired of watching
                  businesses lose time and money on something that should be simple.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-bold rounded-lg transition-all duration-300 shadow-lg shadow-yellow-500/50 hover:shadow-xl hover:shadow-yellow-400/60 border-2 border-yellow-600 uppercase"
                >
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Right column - Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Image
                  src={"/images/SLEDGE-MEET.png"}
                  alt="SLEDGE Team Meeting"
                  height={500}
                  width={500}
                  className="w-auto h-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-200"
                />
              </motion.div>
            </div>

            {/* Mission and Vision Cards - Now in their own row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mission Card */}
                <Card className="p-6 border-8 border-yellow-600/60 bg-gradient-to-br from-gray-900 to-black hover:shadow-[0_0_40px_rgba(253,176,34,0.5),inset_0_0_30px_rgba(0,0,0,0.6)] transition-all duration-300 rounded-none">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-500/20 border-2 border-yellow-600/40">
                      <Target className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 uppercase">
                        Our Mission
                      </h3>
                      <p className="text-gray-300 text-sm leading-6">
                        To take the headache out of accounts payable by giving
                        builders, contractors, and small businesses the tools to
                        manage invoices effortlessly, pay vendors on time, and keep
                        every project moving forward.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Vision Card */}
                <Card className="p-6 border-8 border-orange-600/60 bg-gradient-to-br from-gray-900 to-black hover:shadow-[0_0_40px_rgba(245,158,11,0.5),inset_0_0_30px_rgba(0,0,0,0.6)] transition-all duration-300 rounded-none">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-orange-500/20 border-2 border-orange-600/40">
                      <Eye className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 uppercase">
                        Our Vision
                      </h3>
                      <p className="text-gray-300 text-sm leading-6">
                        A world where no business loses time, money, or
                        opportunities because of messy invoice processes. We're
                        building the future of accounts payable — faster, smarter,
                        and built for the trades.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
