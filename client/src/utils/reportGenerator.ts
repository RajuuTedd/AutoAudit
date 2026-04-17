// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export const generatePDFReport = (url: string, violations: any[]) => {
//   const doc = new jsPDF();
//   const date = new Date().toLocaleDateString();

//   // Header
//   doc.setFontSize(20);
//   doc.setTextColor(64, 121, 255); // AutoAudit Blue
//   doc.text("AutoAudit: Compliance Report", 14, 22);

//   doc.setFontSize(10);
//   doc.setTextColor(100);
//   doc.text(`Target URL: ${url}`, 14, 32);
//   doc.text(`Date: ${date}`, 14, 38);

//   // Summary logic
//   const total = violations.length;
//   const critical = violations.filter((v) => {
//     const sev = (v.requirement?.severity_default || "").toLowerCase();
//     return sev === "high" || sev === "critical" || sev === "error";
//   }).length;

//   doc.setFontSize(14);
//   doc.setTextColor(0);
//   doc.text("Executive Summary", 14, 50);
//   doc.setFontSize(10);
//   doc.text(`This automated audit identified ${total} violations.`, 14, 58);
//   doc.text(`Critical/High Risk findings: ${critical}`, 14, 64);

//   // --- THE FIX: Correctly mapping your nested violations structure ---
//   const tableRows = violations.map((v, index) => {
//     // Safely get values or use fallbacks to avoid toUpperCase() errors
//     const description =
//       v.requirement?.description || v.requirement?.id || "No Description";
//     const severity = v.requirement?.severity_default || "LOW";

//     // Get the regulation ID from the first rule if it exists
//     const regulation = v.rules?.[0]?.regulation?.id || "General";

//     return [
//       index + 1,
//       description,
//       severity.toUpperCase(), // Now safe because of the fallback above
//       regulation.toUpperCase(),
//     ];
//   });

//   autoTable(doc, {
//     startY: 75,
//     head: [["#", "Issue Description", "Severity", "Regulation"]],
//     body: tableRows,
//     headStyles: { fillColor: [64, 121, 255] },
//     alternateRowStyles: { fillColor: [245, 245, 245] },
//     columnStyles: {
//       1: { cellWidth: 100 }, // Give description more space
//     },
//   });

//   doc.save(`AutoAudit_Report_${url.replace(/[^a-z0-9]/gi, "_")}.pdf`);
// };

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = {
  primary: [30, 41, 90] as [number, number, number], // Deep navy
  accent: [64, 121, 255] as [number, number, number], // AutoAudit blue
  danger: [220, 53, 69] as [number, number, number], // Red for critical
  warning: [255, 153, 0] as [number, number, number], // Orange for high
  info: [23, 162, 184] as [number, number, number], // Teal for medium
  success: [40, 167, 69] as [number, number, number], // Green for low
  lightGray: [248, 249, 252] as [number, number, number],
  midGray: [220, 224, 235] as [number, number, number],
  darkGray: [80, 90, 110] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [15, 20, 40] as [number, number, number],
};

const getSeverityColor = (severity: string): [number, number, number] => {
  const s = severity.toLowerCase();
  if (s === "critical" || s === "error") return COLORS.danger;
  if (s === "high") return COLORS.warning;
  if (s === "medium") return COLORS.info;
  return COLORS.success;
};

const getSeverityLabel = (severity: string): string => {
  const s = severity.toLowerCase();
  if (s === "critical" || s === "error") return "CRITICAL";
  if (s === "high") return "HIGH";
  if (s === "medium") return "MEDIUM";
  return "LOW";
};

export const generatePDFReport = (url: string, violations: any[]) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── HEADER BANNER ──────────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 42, "F");

  // Accent stripe
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 38, pageW, 4, "F");

  // Logo / Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.white);
  doc.text("AutoAudit", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 255);
  doc.text("Compliance & Accessibility Report", 14, 26);

  // Right-side meta block
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 255);
  doc.text(`Generated: ${date}`, pageW - 14, 16, { align: "right" });
  doc.text(`Confidential`, pageW - 14, 22, { align: "right" });

  // ── TARGET URL PILL ────────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255, 0.1);
  doc.setDrawColor(100, 130, 200);
  doc.roundedRect(13, 29, pageW - 26, 7, 2, 2, "S");
  doc.setFontSize(8);
  doc.setTextColor(200, 215, 255);
  doc.text("TARGET", 17, 34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  // Truncate long URLs
  const maxUrlWidth = pageW - 60;
  const urlText = doc.splitTextToSize(url, maxUrlWidth)[0];
  doc.text(urlText, 35, 34);

  // ── SUMMARY CARDS ──────────────────────────────────────────────────────────
  const total = violations.length;
  const critical = violations.filter((v) => {
    const s = (v.requirement?.severity_default || "").toLowerCase();
    return s === "critical" || s === "error";
  }).length;
  const high = violations.filter(
    (v) => (v.requirement?.severity_default || "").toLowerCase() === "high",
  ).length;
  const medium = violations.filter(
    (v) => (v.requirement?.severity_default || "").toLowerCase() === "medium",
  ).length;
  const low = total - critical - high - medium;

  const cards = [
    { label: "Total Issues", value: total, color: COLORS.accent },
    { label: "Critical", value: critical, color: COLORS.danger },
    { label: "High", value: high, color: COLORS.warning },
    { label: "Medium / Low", value: `${medium} / ${low}`, color: COLORS.info },
  ];

  const cardY = 50;
  const cardW = (pageW - 28 - 9) / 4;
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(x, cardY, cardW, 22, 2, 2, "F");
    doc.setFillColor(...card.color);
    doc.roundedRect(x, cardY, 3, 22, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...card.color);
    doc.text(String(card.value), x + cardW / 2 + 1, cardY + 12, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.darkGray);
    doc.text(card.label.toUpperCase(), x + cardW / 2 + 1, cardY + 18, {
      align: "center",
    });
  });

  // ── SECTION TITLE ──────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primary);
  doc.text("Violation Details", 14, 84);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(14, 86, 60, 86);

  // ── VIOLATIONS TABLE ───────────────────────────────────────────────────────
  const tableRows = violations.map((v, index) => {
    const description =
      v.requirement?.description || v.requirement?.id || "No Description";
    const rawSeverity = v.requirement?.severity_default || "low";
    const severity = getSeverityLabel(rawSeverity);
    const regulation = v.rules?.[0]?.regulation?.id || "General";
    return [index + 1, description, severity, regulation.toUpperCase()];
  });

  autoTable(doc, {
    startY: 90,
    head: [["#", "Issue Description", "Severity", "Regulation"]],
    body: tableRows,
    margin: { left: 14, right: 14 },
    tableLineColor: COLORS.midGray,
    tableLineWidth: 0.1,
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      textColor: COLORS.black,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", textColor: COLORS.darkGray },
      1: { cellWidth: "auto" },
      2: { cellWidth: 24, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
    },
    didParseCell(data) {
      // Color-code severity badges
      if (data.column.index === 2 && data.section === "body") {
        const sev = String(data.cell.raw || "");
        const color = getSeverityColor(sev);
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = "bold";
      }
    },
    // ── FOOTER on each page ─────────────────────────────────────────────────
    didDrawPage(data) {
      const pg = (doc as any).internal.getCurrentPageInfo().pageNumber;
      const total = (doc as any).internal.getNumberOfPages();

      // Footer bar
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, pageH - 12, pageW, 12, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(180, 200, 255);
      doc.text("AutoAudit — Confidential Compliance Report", 14, pageH - 4.5);
      doc.text(`Page ${pg} of ${total}`, pageW - 14, pageH - 4.5, {
        align: "right",
      });
    },
  });

  doc.save(`AutoAudit_Report_${url.replace(/[^a-z0-9]/gi, "_")}.pdf`);
};
