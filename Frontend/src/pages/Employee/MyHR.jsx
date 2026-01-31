import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building , Award } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../Components/Layout/DashboardLayout';

const MyHR = () => {
    const [hrDetails, setHrDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyHR();
    }, []);

    const fetchMyHR = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/employees/my-hr', config);
            setHrDetails(data);
        } catch (error) {
            console.error("Error fetching HR details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-10 text-center text-gray-500">Loading HR details...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto p-6 space-y-8"
            >
                <div className="text-center space-y-4 mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Your HR Manager</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Here are the details of your assigned HR manager.
                    </p>
                </div>

                {hrDetails ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-linear-to-r from-[#2C9DE6] to-[#205081] h-32 relative">
                            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                                {hrDetails.profilePhoto ? (
                                    <img
                                        src={hrDetails.profilePhoto}
                                        alt={hrDetails.name}
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-[#2C9DE6] uppercase">
                                        {hrDetails.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="pt-20 pb-8 px-6 text-center">
                            <h2 className="text-2xl font-bold text-[#4E4E4E] mb-1">
                                 {hrDetails.name}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-[#2C9DE6] font-medium mb-6">
                                <Award className="w-4 h-4" />
                                <span>{hrDetails.designation}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-3 hover:bg-[#2C9DE6]/10 transition-colors">
                                    <div className="p-3 bg-white rounded-full shadow-xs">
                                        <Mail className="w-5 h-5 text-[#2C9DE6]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Email</p>
                                        <a href={`mailto:${hrDetails.email}`} className="text-[#4E4E4E] font-medium hover:text-[#2C9DE6] transition-colors break-all">
                                          {hrDetails.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-3 hover:bg-[#2C9DE6]/10 transition-colors">
                                    <div className="p-3 bg-white rounded-full shadow-xs">
                                        <Phone className="w-5 h-5 text-[#2C9DE6]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Phone</p>
                                        <a href={`tel:${hrDetails.phone}`} className="text-[#4E4E4E] font-medium hover:text-[#2C9DE6] transition-colors">
                                          {hrDetails.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-3 hover:bg-[#2C9DE6]/10 transition-colors">
                                    <div className="p-3 bg-white rounded-full shadow-xs">
                                        <Building className="w-5 h-5 text-[#2C9DE6]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Department</p>
                                        <p className="text-[#4E4E4E] font-medium">
                                           {hrDetails.department}
                                        </p>
                                    </div>
                                </div>
                            </div>

                             {/* <div className="mt-8 pt-8 border-t border-gray-100">
                            </div> */}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Manager Assigned</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            You currently do not have a specific manager assigned to your profile.
                        </p>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default MyHR;