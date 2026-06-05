/**
 * Certificate generation utilities.
 * Handles unique ID generation and PDF/PNG export.
 */

/**
 * Generate a unique certificate ID.
 * Format: CERT-{YEAR}-{6 alphanumeric chars}
 * Example: CERT-2026-X7B91K
 */
export function generateCertificateId() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CERT-${year}-${random}`;
}

/**
 * Generate a PNG image from a DOM element.
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} filename - Download filename
 */
export async function generatePNG(element, filename = 'certificate.png') {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Generate a PDF from a DOM element.
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} filename - Download filename
 */
export async function generatePDF(element, filename = 'certificate.pdf') {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Landscape A4
  const pdf = new jsPDF({
    orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgWidth, imgHeight],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}
