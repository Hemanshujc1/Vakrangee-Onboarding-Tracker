const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Utility to convert camelCase/snake_case keys to Title Case
const formatLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

// Generates a PDF representing the submitted form
exports.generateFormPDF = async (employee, formRecord, targetPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(targetPath);
      doc.pipe(stream);

      const formType = formRecord.form_type;
      const formData = formRecord.data || {};
      const submissionDate = formRecord.submitted_at || formRecord.updatedAt || new Date();
      
      const pi = employee.EmployeeRecord?.personal_info || {};
      const fullName = `${pi.firstname || ''} ${pi.lastname || ''}`.trim() || employee.employee_id;
      const employeeCode = employee.employee_id;

      // Header Block
      doc.fillColor('#1e3a8a').fontSize(20).text(formatLabel(formType) + ' FORM', { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fillColor('#4b5563').fontSize(10).text(`Candidate Name: ${fullName}`, { align: 'left' });
      doc.text(`Employee ID: ${employeeCode}`, { align: 'left' });
      doc.text(`Submitted On: ${new Date(submissionDate).toLocaleDateString()}`, { align: 'left' });
      
      // Divider
      doc.moveDown(0.8);
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      doc.fillColor('#1f2937').fontSize(11);

      // Render content based on Form Type
      if (formType === 'NDA') {
        doc.fontSize(14).fillColor('#111827').text('NON-DISCLOSURE AGREEMENT', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(10).fillColor('#374151');
        
        const ndaText = `This Non-Disclosure Agreement (the "Agreement") is entered into by and between Vakrangee Limited and the Employee.

1. Confidential Information: The Employee agrees to keep all proprietary information, trade secrets, software codes, customer data, and business plans strictly confidential.
2. Obligation of Confidentiality: The Employee shall not disclose, copy, publish, or use any Confidential Information for personal benefit or to any third party during or after the employment tenure.
3. Term: This Agreement shall remain in effect indefinitely from the date of execution.
4. Consequences: Any breach of this agreement may lead to immediate termination of employment and legal actions.

By signing below, the candidate agrees to the terms and conditions outlined in this Non-Disclosure Agreement.`;
        
        doc.text(ndaText, { align: 'justify', lineGap: 4 });
        doc.moveDown(2);
      } 
      else if (formType === 'DECLARATION') {
        doc.fontSize(14).fillColor('#111827').text('DECLARATION', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(10).fillColor('#374151');

        const decText = `I, ${fullName}, hereby declare that all the information provided in the onboarding portal, forms, and documents is true, correct, and complete to the best of my knowledge.

I understand that if any of the information is found to be false, incorrect, or misleading at any stage, the company reserves the right to take appropriate disciplinary or legal action, including termination of employment without notice.`;

        doc.text(decText, { align: 'justify', lineGap: 4 });
        doc.moveDown(2);
      } 
      else {
        // Generic structured rendering of other forms
        doc.fontSize(12).fillColor('#111827').text('Form Details', { underline: true });
        doc.moveDown(1);

        doc.fontSize(10).fillColor('#374151');
        
        // Loop over the form fields and format them nicely
        const excludedKeys = ['isDraft', 'signature', 'signature_path', 'rubber_stamp', 'signature_preview'];
        
        for (const [key, value] of Object.entries(formData)) {
          if (excludedKeys.includes(key)) continue;
          
          const label = formatLabel(key);

          // If value is a nested object/array
          if (typeof value === 'object' && value !== null) {
            doc.fillColor('#1f2937').fontSize(11).text(label + ':', { bold: true });
            doc.moveDown(0.2);
            doc.fillColor('#374151').fontSize(10);
            
            if (Array.isArray(value)) {
              value.forEach((item, idx) => {
                if (typeof item === 'object') {
                  const itemDetails = Object.entries(item)
                    .map(([k, v]) => `${formatLabel(k)}: ${v}`)
                    .join(' | ');
                  doc.text(`  ${idx + 1}. ${itemDetails}`);
                } else {
                  doc.text(`  - ${item}`);
                }
              });
            } else {
              Object.entries(value).forEach(([k, v]) => {
                doc.text(`  ${formatLabel(k)}: ${v}`);
              });
            }
            doc.moveDown(0.5);
          } else {
            // Standard key-value output
            doc.fillColor('#4b5563').text(`${label}: `, { continued: true });
            doc.fillColor('#111827').text(String(value));
            doc.moveDown(0.4);
          }

          // Handle page breaks
          if (doc.y > 700) {
            doc.addPage();
          }
        }
      }

      // Embed signature and verification details if available
      doc.moveDown(2);
      if (doc.y > 650) {
        doc.addPage();
      }

      // Draw bottom line
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      const signY = doc.y;

      // Left Column: Candidate Signature
      doc.fillColor('#111827').fontSize(10).text('Candidate Signature:', 50, signY);
      
      let signatureFound = false;
      const signatureFilename = formData.signature || formData.signature_path || employee.EmployeeRecord?.signature;
      
      if (signatureFilename) {
        const sigPath = path.join(__dirname, '..', 'uploads', 'signatures', signatureFilename);
        if (fs.existsSync(sigPath)) {
          try {
            doc.image(sigPath, 50, signY + 15, { height: 40 });
            signatureFound = true;
          } catch (imgErr) {
            logger.error('Error rendering signature in PDF: %o', imgErr);
          }
        }
      }

      if (!signatureFound) {
        doc.fillColor('#9ca3af').fontSize(9).text('(Digitally Signed / E-Signed)', 50, signY + 20);
      }

      // Right Column: Verification Status
      doc.fillColor('#111827').fontSize(10).text('Verification Status:', 350, signY);
      
      const status = formRecord.status || 'SUBMITTED';
      doc.fillColor(status === 'VERIFIED' ? '#16a34a' : '#ea580c').fontSize(10).text(status, 350, signY + 15, { bold: true });
      
      if (formRecord.verified_at) {
        doc.fillColor('#4b5563').fontSize(9).text(`Verified Date: ${new Date(formRecord.verified_at).toLocaleDateString()}`, 350, signY + 30);
      }

      doc.end();
      stream.on('finish', () => resolve(true));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};
