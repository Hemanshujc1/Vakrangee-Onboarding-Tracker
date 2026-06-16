const fs = require("fs");
const path = require("path");
const { ZipArchive } = require("archiver");
const {
  EmployeeMaster,
  EmployeeRecord,
  FormSubmission,
  EmployeeDocument,
} = require("../../models");
const logger = require("../../utils/logger");
const { generateFormPDFs } = require("../pdf/pdfGenerator.service");

const FORM_FILE_NAMES = {
  EMPLOYMENT_APP: "Application_Form",
  DECLARATION: "Declaration_Form",
  MEDICLAIM: "Mediclaim_Form",
  GRATUITY: "Gratuity_Form",
  EMPLOYEE_INFO: "Employee_Information_Form",
  NDA: "Non_Disclosure_Agreement",
  TDS: "TDS_Declaration_Form",
  EPF: "EPF_Form",
};

exports.exportDocumentsToZip = async (employeeId, selectedFiles, authToken, res) => {
  const employee = await EmployeeMaster.findOne({
    where: { id: employeeId },
    include: [{ model: EmployeeRecord }],
  });

  if (!employee) {
    throw new Error("Employee profile not found");
  }

  const pi = employee.EmployeeRecord?.personal_info || {};
  const firstName = pi.firstname || "";
  const lastName = pi.lastname || "";
  const rawEmployeeName = `${firstName} ${lastName}`.trim() || employee.employee_id;
  const employeeName = rawEmployeeName.toLowerCase().replace(/\s+/g, "_");

  const reportLines = [
    "==================================================",
    "ONBOARDING DOCUMENTS & FORMS DOWNLOAD REPORT",
    "==================================================",
    `Date/Time: ${new Date().toLocaleString()}`,
    `Employee Name: ${rawEmployeeName}`,
    `Employee Code: ${employee.employee_id}`,
    `Requested Files Count: ${selectedFiles ? selectedFiles.length : 0}`,
    "--------------------------------------------------",
    "STATUS OF DOWNLOADED FILES:",
    "--------------------------------------------------",
  ];

  let successCount = 0;
  let failCount = 0;

  const docItems = [];
  const formItems = [];

  if (selectedFiles && Array.isArray(selectedFiles)) {
    for (const file of selectedFiles) {
      try {
        if (file.category === "documents") {
          const doc = await EmployeeDocument.findOne({
            where: {
              employee_id: employee.employee_id,
              document_type: file.key,
            },
          });

          if (!doc) {
            reportLines.push(`[FAILED] Category: Documents | Type: ${file.key} | Reason: Record not found in database`);
            failCount++;
            continue;
          }

          let targetFolder = "documents";
          if (doc.document_type === "Passport Size Photo") targetFolder = "profilepic";
          else if (doc.document_type === "Signature") targetFolder = "signatures";

          const docFilePath = path.join(__dirname, "..", "..", "uploads", targetFolder, doc.file_path);

          if (fs.existsSync(docFilePath)) {
            const ext = path.extname(doc.original_name || doc.file_path) || ".pdf";
            const docTypeFormatted = doc.document_type.replace(/\s+/g, "_");
            const archiveName = `${employeeName}_${docTypeFormatted}${ext}`;

            let zipFolder = "Documents";
            if (doc.document_type === "Background Verification Form") zipFolder = "Pre1 Joining Forms";
            else if (doc.document_type === "Joining Form") zipFolder = "Post Joining Forms";

            docItems.push({ file, doc, docFilePath, archiveName, zipFolder });
          } else {
            reportLines.push(`[FAILED] Category: Documents | Type: ${doc.document_type} | Reason: File missing on server at ${doc.file_path}`);
            failCount++;
          }
        } else if (file.category === "preJoiningForms" || file.category === "postJoiningForms") {
          const formRecord = await FormSubmission.findOne({
            where: { form_type: file.key, employee_id: employee.employee_id },
          });

          if (!formRecord) {
            reportLines.push(`[FAILED] Category: Forms | Key: ${file.key} | Reason: Form submission not found in database`);
            failCount++;
            continue;
          }

          const folderName = file.category === "preJoiningForms" ? "Pre Joining Forms" : "Post Joining Forms";
          const formNameLabel = FORM_FILE_NAMES[file.key] || file.key;
          const archiveName = `${employeeName}_${formNameLabel}.pdf`;

          formItems.push({ file, formRecord, folderName, archiveName });
        }
      } catch (err) {
        logger.error(`Error pre-processing item ${file.key}/${file.category}: %o`, err);
        reportLines.push(`[ERROR] Category: ${file.category} | Key: ${file.key} | Error: ${err.message}`);
        failCount++;
      }
    }
  }

  let pdfResults = [];
  if (formItems.length > 0) {
    const pdfRequests = formItems.map((item) => ({
      key: item.file.key,
      employeeId: employee.id,
      authToken,
    }));
    logger.info(`downloadDocuments: generating ${pdfRequests.length} form PDF(s) in parallel`);
    pdfResults = await generateFormPDFs(pdfRequests);
  }

  const pdfResultMap = {};
  for (const result of pdfResults) {
    pdfResultMap[result.key] = result;
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="employee_documents.zip"`,
  );

  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.on("error", (err) => {
    logger.error("Archive error: %o", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error creating ZIP archive" });
    }
  });

  archive.pipe(res);

  for (const { doc, docFilePath, archiveName, zipFolder } of docItems) {
    archive.file(docFilePath, { name: `${employeeName}/${zipFolder}/${archiveName}` });
    reportLines.push(`[SUCCESS] Category: Documents | Type: ${doc.document_type} -> ${zipFolder}/${archiveName}`);
    successCount++;
  }

  for (const { file, folderName, archiveName } of formItems) {
    const result = pdfResultMap[file.key];
    if (result && result.buffer) {
      archive.append(Buffer.from(result.buffer), { name: `${employeeName}/${folderName}/${archiveName}` });
      reportLines.push(`[SUCCESS] Category: Forms | Key: ${file.key} -> ${folderName}/${archiveName}`);
      successCount++;
    } else {
      const reason = result?.error || "PDF generation failed";
      reportLines.push(`[FAILED] Category: Forms | Key: ${file.key} | Reason: ${reason}`);
      failCount++;
    }
  }

  logger.info(`downloadDocuments: ZIP ready for ${rawEmployeeName} — ${successCount} success, ${failCount} failed`);

  await archive.finalize();
};
