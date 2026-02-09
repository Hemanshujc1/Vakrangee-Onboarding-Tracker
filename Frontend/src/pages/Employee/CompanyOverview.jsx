import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Shield, Users, Zap } from 'lucide-react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';

const CompanyOverview = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const values = [
    { icon: Heart, title: 'Service', desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, molestiae.' },
    { icon: Shield, title: 'Integrity', desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, molestiae.' },
    { icon: Zap, title: 'Innovation', desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, molestiae.' },
    { icon: Users, title: 'Inclusivity', desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, molestiae.' },
  ];

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-screen font-sans text-gray-900">

        {/* Hero */}
        <div className="relative bg-(--color-secondary) h-88 sm:h-104 md:h-96 flex items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-linear-to-r from-(--color-secondary) to-(--color-primary) opacity-90" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl text-white"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-4">
              Est. 1990
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Connecting India,{" "}
              <span className="text-transparent bg-clip-text bg-white">
                Empowering Lives.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-2xl text-gray-200 max-w-xl mx-auto">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, placeat.
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-20 space-y-16 pb-20"
        >

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <motion.div variants={item} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-t-4 border-(--color-primary)">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-(--color-primary)">
                <Target className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-(--color-primary)">Our Mission</h2>
              <p className="text-gray-600 text-sm sm:text-lg">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi voluptates sunt molestias placeat libero.
              </p>
            </motion.div>

            <motion.div variants={item} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-t-4 border-(--color-secondary)">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-(--color-secondary)">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-(--color-primary)">Our Vision</h2>
              <p className="text-gray-600 text-sm sm:text-lg">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores quia modi harum hic.
              </p>
            </motion.div>
          </div>

          {/* Core Values */}
          <div>
            <motion.div variants={item} className="text-center mb-10">
              <h3 className="text-(--color-primary) uppercase text-sm font-semibold">Our Foundation</h3>
              <h2 className="text-2xl sm:text-3xl font-bold text-(--color-primary)">Core Values</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="bg-white p-5 rounded-xl shadow-xs border border-gray-100"
                >
                  <val.icon className="w-8 h-8 sm:w-10 sm:h-10 text-(--color-accent-gold) mb-3" />
                  <h4 className="font-bold text-(--color-primary) mb-1">{val.title}</h4>
                  <p className="text-sm text-gray-500">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Culture */}
          <motion.div variants={item} className="bg-linear-to-br from-(--color-secondary) to-(--color-primary) rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 sm:p-10 lg:p-16 items-center">
              <div className="text-white space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">Life at Vakrangee</h2>
                <p className="text-blue-100 text-sm sm:text-lg">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam, facere!
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">Lorem ipsum</span>
                  <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">Lorem ipsum</span>
                  <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">Lorem ipsum</span>
                </div>
              </div>

              <div className="hidden lg:block">
                <img
                  src="https://images.unsplash.com/photo-1543269865-cbf427effbad"
                  alt="Team"
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyOverview;
