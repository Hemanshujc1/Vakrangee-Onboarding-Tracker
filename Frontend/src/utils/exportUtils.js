import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data, columns, filename = 'export.csv') => {
  if (!data.length) return;

  // Header row
  const headers = columns.map(col => col.label).join(',');
  
  // Data rows
  const rows = data.map(row => {
    return columns.map(col => {
      let cellData = row[col.key] || '';
      // Escape quotes and wrap in quotes if contains comma
      if (typeof cellData === 'string' && (cellData.includes(',') || cellData.includes('"'))) {
        cellData = `"${cellData.replace(/"/g, '""')}"`;
      }
      return cellData;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToPDF = (data, columns, filename = 'export.pdf') => {
  if (!data.length) return;
  
  const doc = new jsPDF();

  const tableColumn = columns.map(col=>col.label);
  const tableRows = [];

  data.forEach(item=>{
    const itemData=columns.map(col=>item[col.key] || '');
    tableRows.push(itemData);
  });

  doc.text('Employee Report',14,15);
  autoTable(doc,{
    head: [tableColumn],
    body: tableRows,
    startY:20,
  });
 
  doc.save(filename);
};

