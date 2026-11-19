import jsPDF from 'jspdf';
import { RoastResult } from '../types/roaster';

export function exportRoastReportPdf(result: RoastResult, targetRole?: string, fileName?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  function checkPageBreak(requiredHeight: number) {
    if (cursorY + requiredHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      drawHeaderFooter();
    }
  }

  function drawHeaderFooter() {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('RESUME ROASTER 🔥 - CONFIDENTIAL ANALYSIS', margin, 10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, 10);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  }

  drawHeaderFooter();

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(234, 88, 12); // Orange
  doc.text('RESUME ROAST REPORT', margin, cursorY);
  cursorY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const subtitle = targetRole
    ? `Target Role: ${targetRole} | File: ${fileName || 'Pasted Content'}`
    : `Target: General Industry Standards | File: ${fileName || 'Pasted Content'}`;
  doc.text(subtitle, margin, cursorY);
  cursorY += 8;

  // Score Bar Container
  doc.setFillColor(28, 25, 23);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Overall Score: ${result.overallScore}/100`, margin + 6, cursorY + 10);
  doc.text(`ATS Score: ${result.atsScore.score}/100`, margin + 60, cursorY + 10);
  doc.text(`Content Score: ${result.contentQualityScore.score}/100`, margin + 115, cursorY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(251, 146, 60);
  doc.text(`Verdict: ${result.finalVerdict.badge}`, margin + 6, cursorY + 18);
  cursorY += 32;

  // Roast Summary
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(225, 29, 72);
  doc.text(`🔥 "${result.roastTitle}"`, margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);
  const oneLinerLines = doc.splitTextToSize(`"${result.roastOfTheDay}"`, contentWidth);
  doc.text(oneLinerLines, margin, cursorY);
  cursorY += oneLinerLines.length * 5 + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  const summaryLines = doc.splitTextToSize(result.roastSummary, contentWidth);
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 4.5 + 8;

  // Top Brutal Truths
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text('THE BRUTAL TRUTH (Top Weaknesses)', margin, cursorY);
  cursorY += 6;

  result.brutalTruth.forEach((item, idx) => {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(220, 38, 38);
    doc.text(`${idx + 1}. ${item.title}`, margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    const detail = `Problem: ${item.whatIsWrong}\nWhy it hurts: ${item.whyItIsAProblem}\nFix: ${item.howToFix}`;
    const itemLines = doc.splitTextToSize(detail, contentWidth - 4);
    doc.text(itemLines, margin + 4, cursorY);
    cursorY += itemLines.length * 4 + 4;
  });

  // Red Flags
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text('RED FLAG DETECTOR 🚩', margin, cursorY);
  cursorY += 6;

  result.redFlags.forEach((rf) => {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text(`[${rf.severity.toUpperCase()}] ${rf.flag}`, margin, cursorY);
    cursorY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    const rfText = `Evidence: ${rf.evidence}\nRemedy: ${rf.remedy}`;
    const rfLines = doc.splitTextToSize(rfText, contentWidth - 4);
    doc.text(rfLines, margin + 4, cursorY);
    cursorY += rfLines.length * 4 + 4;
  });

  // Recruiter Perspective
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("RECRUITER'S 6-SECOND PERSPECTIVE 👔", margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  const recruiterNotes = [
    `First Impression: ${result.recruiterReview.firstImpression}`,
    `Strongest Asset: ${result.recruiterReview.strongestSellingPoint}`,
    `Biggest Concern: ${result.recruiterReview.biggestConcern}`,
    `Easy to Scan: ${result.recruiterReview.easyToScan ? 'Yes' : 'No'} - ${result.recruiterReview.scanExplanation}`,
    `Deal Breaker Risk: ${result.recruiterReview.dealBreakerRisk}`,
  ];
  recruiterNotes.forEach((note) => {
    checkPageBreak(12);
    const lines = doc.splitTextToSize(note, contentWidth);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 4.2 + 2;
  });

  // Improvements Before & After
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text('ACTIONABLE BEFORE & AFTER TRANSFORMATIONS ✨', margin, cursorY);
  cursorY += 6;

  result.improvementSuggestions.forEach((sug, i) => {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(`Transformation #${i + 1} (${sug.section})`, margin, cursorY);
    cursorY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 50, 50);
    const beforeText = `BEFORE: "${sug.before}"`;
    const beforeLines = doc.splitTextToSize(beforeText, contentWidth - 4);
    doc.text(beforeLines, margin + 4, cursorY);
    cursorY += beforeLines.length * 3.8 + 2;

    doc.setTextColor(16, 120, 60);
    const afterText = `AFTER: "${sug.after}"`;
    const afterLines = doc.splitTextToSize(afterText, contentWidth - 4);
    doc.text(afterLines, margin + 4, cursorY);
    cursorY += afterLines.length * 3.8 + 2;

    doc.setTextColor(80, 80, 80);
    const impactText = `Why it works: ${sug.impactExplanation}`;
    const impactLines = doc.splitTextToSize(impactText, contentWidth - 4);
    doc.text(impactLines, margin + 4, cursorY);
    cursorY += impactLines.length * 3.8 + 4;
  });

  // Save the PDF
  const cleanName = (fileName || 'resume_roast').replace(/\.[^/.]+$/, '');
  doc.save(`${cleanName}_roast_analysis.pdf`);
}
