import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Shield, Users, Zap } from 'lucide-react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';

const CompanyOverview = () => {
  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
      
      <div className="relative bg-(--color-secondary) h-96 overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-linear-to-r from-(--color-secondary) to-(--color-primary) opacity-90" />
       
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto text-white"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-md shadow-sm">
            Est. 1990
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-sm">
            Connecting India, <span className="text-transparent bg-clip-text bg-white">Empowering Lives.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, placeat.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 space-y-16 pb-20"
      >
        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={item} className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-(--color-primary) hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-(--color-primary)">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-(--color-primary)">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi voluptates sunt molestias placeat libero, labore tenetur. Cupiditate mollitia reprehenderit possimus.
            </p> 
          </motion.div>

          <motion.div variants={item} className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-(--color-secondary) hover:transform hover:-translate-y-1 transition-all duration-300">
             <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-(--color-secondary)">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-(--color-primary)">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores quia modi harum hic ex quos fugit non repellendus rem nemo?
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="py-8">
          <motion.div variants={item} className="text-center mb-12">
            <h3 className="text-(--color-primary) font-semibold tracking-wide uppercase text-sm mb-2">Our Foundation</h3>
            <h2 className="text-3xl font-bold text-(--color-primary)">Core Values</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 hover:shadow-md transition-shadow"
              >
                <val.icon className="w-10 h-10 text-(--color-accent-gold) mb-4" />
                <h4 className="text-lg font-bold mb-2 text-(--color-primary)">{val.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Culture Section */}
        <motion.div variants={item} className="bg-linear-to-br from-(--color-secondary) to-(--color-primary) rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 lg:p-16 items-center relative z-10">
            <div className="text-white space-y-6">
              <h2 className="text-3xl font-bold">Life at Vakrangee</h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam, facere! Deserunt possimus maxime fugiat quo ut perspiciatis incidunt perferendis rem.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-xs text-sm font-medium">Lorem, ipsum dolor.</span>
                 <span className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-xs text-sm font-medium">Lorem, ipsum dolor.</span>
                 <span className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-xs text-sm font-medium">Lorem, ipsum dolor.</span>
              </div>
            </div>
            <div className="hidden lg:block relative">
                 <img 
                  src="https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                  alt="Team Collaboration" 
                  className="rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500" 
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
