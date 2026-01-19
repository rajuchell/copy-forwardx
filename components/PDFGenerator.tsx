import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { CartItem, ClientInfo, ProposalConfig } from '../types';

interface PDFGeneratorProps {
  cart: CartItem[];
  clientInfo: ClientInfo;
  executiveSummary?: string;
  config?: ProposalConfig;
  onDownload?: () => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ cart, clientInfo, executiveSummary, config, onDownload }) => {
  
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // Colors
    const darkNavy: [number, number, number] = [15, 23, 42]; // Slate 900
    const textGray: [number, number, number] = [51, 65, 85]; // Slate 700
    const lightGray: [number, number, number] = [100, 116, 139]; // Slate 500

    // --- 1. Header Row ---
    const headerY = 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...darkNavy);
    const headerTitle = config?.headerTitle || "PROJECT PROPOSAL";
    doc.text(headerTitle.toUpperCase(), margin, headerY);

    // Logo setup
    const s = 0.5;
    const logoRightEdge = pageWidth - margin; 
    const logoX = logoRightEdge - 70; 
    const logoY = headerY - 5; 

    const drawChevron = (offsetX: number, fillColor: [number, number, number]) => {
      doc.setFillColor(...fillColor);
      doc.lines([[15*s, 15*s], [-15*s, 15*s], [12*s, 0], [15*s, -15*s], [-15*s, -15*s], [-12*s, 0]], logoX + (offsetX*s), logoY + (5*s), [1, 1], 'F', true);
    };

    drawChevron(0, [15, 23, 42]); 
    drawChevron(15, [59, 130, 246]); 
    drawChevron(30, [147, 197, 253]); 

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...darkNavy);
    doc.text("FORWARDWORKX", logoX + (45 * s) + 6, logoY + 12);

    // --- 2. Sender Address ---
    let yPos = headerY + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textGray);

    const senderAddress = [
      "1st & 2nd Floor, DRMK Towers,",
      "19th Cross Rd, 24th Main Rd, 5th Phase,",
      "J.P.Nagar, Bengaluru, Karnataka 560078",
      `Email: ${config?.contactEmail || "marketing@forwardworkx.com"}`,
      "Phone: +91 8147272953"
    ];

    senderAddress.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    // --- 3. Client Info ---
    yPos += 10; 
    const sectionTopY = yPos;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...darkNavy);
    doc.text("PREPARED FOR:", margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...textGray);
    const clientBlock = [
      clientInfo.companyName ? `Client: ${clientInfo.companyName}` : null,
      clientInfo.contactPerson ? `Contact: ${clientInfo.contactPerson}` : null,
      clientInfo.email ? `Email: ${clientInfo.email}` : null,
      clientInfo.phone ? `Phone: ${clientInfo.phone}` : null,
    ].filter(Boolean) as string[];
    clientBlock.forEach(line => { doc.text(line, margin, yPos); yPos += 5; });

    let rightColY = sectionTopY; 
    const rightColX = pageWidth - margin - 40; 
    doc.setFont('helvetica', 'bold'); doc.text("DATE:", rightColX, rightColY);
    rightColY += 6; doc.setFont('helvetica', 'normal'); doc.text(clientInfo.date, rightColX, rightColY);

    // --- 4. Executive Summary ---
    yPos = Math.max(yPos, rightColY + 10) + 10;
    if (executiveSummary) {
        doc.setFont('helvetica', 'bold'); doc.text("EXECUTIVE SUMMARY", margin, yPos);
        yPos += 6; doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(executiveSummary, pageWidth - (margin * 2));
        doc.text(splitText, margin, yPos);
        yPos += (splitText.length * 5) + 5;
    }

    // --- 5. Services Table ---
    yPos += 5; 
    // Simplified headers to ensure single row fit
    const tableRows = cart.map(item => [
      item.name + (item.description ? `\n${item.description}` : ''),
      item.quantity,
      item.price > 0 ? `INR ${item.price.toLocaleString()}` : '-',
      item.monthlyPrice ? `INR ${item.monthlyPrice.toLocaleString()}` : '-',
      `INR ${(item.price * item.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Service Description', 'Qty', 'One-time', 'Monthly', 'Total (One-time)']],
      body: tableRows,
      theme: 'grid', 
      headStyles: { 
        fillColor: darkNavy, 
        textColor: 255, 
        fontStyle: 'bold', 
        halign: 'left', 
        cellPadding: 2, // Minimal padding
        minCellHeight: 6, // Minimal height
        fontSize: 9
      },
      styles: { 
        fontSize: 8.5, 
        cellPadding: 3, 
        textColor: textGray, 
        valign: 'middle', 
        lineWidth: 0.1, 
        lineColor: [230, 230, 230],
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' }, 
        1: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        // Force header alignment to match content for price columns
        if (data.section === 'head') {
          if (data.column.index === 1) data.cell.styles.halign = 'center';
          if (data.column.index >= 2) data.cell.styles.halign = 'right';
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // --- 6. Footer Totals ---
    const totalsX = (pageWidth / 2) + 15;
    let totalsY = finalY;

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const monthlyTotal = cart.reduce((acc, item) => acc + ((item.monthlyPrice || 0) * item.quantity), 0);
    const taxRate = 0.18; 
    const taxAmount = subtotal * taxRate;
    const totalOneTime = subtotal + taxAmount;

    const drawTotalRow = (label: string, value: string, isBold: boolean = false, isAccent: boolean = false) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(isBold ? 10 : 9);
        doc.setTextColor(...(isBold ? darkNavy : textGray));
        if (isAccent) doc.setTextColor(59, 130, 246); // Blue for recurring
        doc.text(label, totalsX, totalsY);
        doc.text(value, pageWidth - margin, totalsY, { align: "right" });
        totalsY += 7;
    };

    drawTotalRow("Subtotal (One-time Setup)", `INR ${subtotal.toLocaleString()}`);
    drawTotalRow("GST (18%)", `INR ${taxAmount.toLocaleString()}`);
    drawTotalRow("Total One-time Investment", `INR ${totalOneTime.toLocaleString()}`, true);
    totalsY += 3;
    if (monthlyTotal > 0) {
      drawTotalRow("Recurring Monthly Subscription", `INR ${monthlyTotal.toLocaleString()}`, true, true);
    }

    let termsY = finalY;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...darkNavy);
    doc.text("TERMS & CONDITIONS", margin, termsY);
    termsY += 5; doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...lightGray);
    const terms = config?.termsAndConditions || [];
    terms.forEach(term => {
        const lines = doc.splitTextToSize(term, (pageWidth / 2) - margin - 5);
        doc.text(lines, margin, termsY); termsY += (lines.length * 3.5);
    });
    
    doc.save(`ForwardWorkx_Proposal_${clientInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    if (onDownload) onDownload();
  };
  
  const isValid = cart.length > 0 && clientInfo.companyName && clientInfo.contactPerson && clientInfo.email;

  return (
    <button onClick={generatePDF} disabled={!isValid} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-all disabled:opacity-50 hover:scale-[1.02]">
      <Download size={24} /> Download Proposal Now
    </button>
  );
};

export default PDFGenerator;