import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Partner, ZoneScore } from '../types';
import { zones } from '../data/zones';
import { deriveStatus } from './analytics';

// Export partners to Excel
export const exportToExcel = (partners: Partner[], zoneScores?: Record<string, ZoneScore>) => {
  // Partners sheet
  const partnersData = partners.map((p) => ({
    'Partner Name': p.name_en,
    'Thai Name': p.name_th || '',
    Category: p.category,
    Zone: zones[p.zone]?.label || p.zone,
    Status: p.contract?.status || deriveStatus(p),
    'Contract Type': p.contract?.type || '',
    'Start Date': p.contract?.start_date || '',
    'End Date': p.contract?.end_date || '',
    'Renewal Owner': p.contract?.renewal_owner || '',
    'Strategic Note': p.strategic_note || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(partnersData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Partners');

  // Zone Scores sheet (if provided)
  if (zoneScores) {
    const zoneData = Object.values(zoneScores).map((score) => ({
      Zone: zones[score.zone]?.label || score.zone,
      'ZAS Score': Math.round(score.zas),
      Coverage: Math.round(score.coverage),
      Health: Math.round(score.health),
      Pressure: Math.round(score.pressureInv),
      Diversity: Math.round(score.diversity),
      'BSI Partners': score.bsiCount,
      Active: score.activeCount,
      Competitors: score.competitorCount,
    }));

    const ws2 = XLSX.utils.json_to_sheet(zoneData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Zone Scores');
  }

  // Download
  XLSX.writeFile(wb, `BSI_Phuket_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export to PDF
export const exportToPDF = (
  partners: Partner[],
  zoneScores: Record<string, ZoneScore>,
  kpis: any
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('BSI Phuket Competitive Analysis Report', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')}`, 14, 28);

  // KPIs Summary
  doc.setFontSize(14);
  doc.text('Executive Summary', 14, 40);

  doc.setFontSize(10);
  let y = 48;
  doc.text(`Total Partners: ${kpis.totalPartners}`, 14, y);
  y += 6;
  doc.text(`Active Partners: ${kpis.activePartners} (${kpis.activeRate}%)`, 14, y);
  y += 6;
  doc.text(`Average Zone Advantage Score: ${kpis.zasAverage}`, 14, y);
  y += 6;
  doc.text(`Contracts Expiring (≤90 days): ${kpis.expiringCount}`, 14, y);
  y += 6;
  doc.text(`Expired Contracts: ${kpis.expiredCount}`, 14, y);
  y += 6;
  doc.text(`Whitespace Opportunities: ${kpis.whitespaceCount}`, 14, y);
  y += 10;

  // Zone Scores Table
  doc.setFontSize(14);
  doc.text('Zone Advantage Scores', 14, y);
  y += 8;

  const zoneTableData = Object.values(zoneScores).map((score) => [
    zones[score.zone]?.label || score.zone,
    Math.round(score.zas).toString(),
    Math.round(score.coverage).toString(),
    Math.round(score.health).toString(),
    score.bsiCount.toString(),
    score.competitorCount.toString(),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Zone', 'ZAS', 'Coverage', 'Health', 'BSI', 'Comp']],
    body: zoneTableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 136, 229] },
    margin: { top: y },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Active Partners Table
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.text('Active Partners', 14, y);
  y += 8;

  const activePartners = partners.filter((p) => deriveStatus(p) === 'active');
  const partnerTableData = activePartners.slice(0, 20).map((p) => [
    p.name_en,
    p.category,
    zones[p.zone]?.label || p.zone,
    p.contract?.end_date || '',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Partner', 'Category', 'Zone', 'End Date']],
    body: partnerTableData,
    theme: 'striped',
    headStyles: { fillColor: [67, 160, 71] },
  });

  // Save
  doc.save(`BSI_Phuket_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Format date for display
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate days until expiry
export const daysUntilExpiry = (endDate?: string): number | null => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days;
};
