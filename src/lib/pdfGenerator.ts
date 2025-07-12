import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  static async generateResumePDF(resumeElement: HTMLElement, filename: string = 'resume.pdf'): Promise<void> {
    try {
      // Ensure the element is visible and properly rendered
      const originalDisplay = resumeElement.style.display;
      const originalVisibility = resumeElement.style.visibility;
      
      resumeElement.style.display = 'block';
      resumeElement.style.visibility = 'visible';
      
      // Wait for any images to load
      const images = resumeElement.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // Create canvas from HTML element with higher quality settings
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: resumeElement.scrollWidth,
        height: resumeElement.scrollHeight,
        logging: false,
        imageTimeout: 15000,
        removeContainer: false
      });

      // Restore original styles
      resumeElement.style.display = originalDisplay;
      resumeElement.style.visibility = originalVisibility;

      // Calculate dimensions for A4 page
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  static async generateCoverLetterPDF(content: string, filename: string = 'cover-letter.pdf'): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set font and size
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      // Add content with proper formatting
      const lines = pdf.splitTextToSize(content, 180);
      let y = 20;
      
      lines.forEach((line: string) => {
        if (y > 270) { // Check if we need a new page
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 15, y);
        y += 6;
      });
      
      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating cover letter PDF:', error);
      throw new Error('Failed to generate cover letter PDF. Please try again.');
    }
  }
}