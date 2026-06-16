// ─── JSON group helpers ────────────────────────────────────────────────────────
exports.getEmpStatus = (emp) => emp?.employee_status || {};
exports.getBasicInfo = (emp) => emp?.basic_info || {};
exports.getPersonalInfo = (rec) => rec?.personal_info || {};
exports.getContactInfo = (rec) => rec?.contact_info || {};
exports.getJobInfo = (rec) => rec?.job_info || {};
exports.getAcademicDetails = (rec) => rec?.academic_details || {};
exports.getPermanentAddress = (rec) => (rec?.address_info || [])[0] || {};
exports.getCommunicationAddress = (rec) => (rec?.address_info || [])[1] || {};

// ─── Work location display helper ─────────────────────────────────────────────
exports.formatWorkLocation = (wl) =>
  wl ? [wl.city, wl.district, wl.state].filter(Boolean).join(", ") : null;
