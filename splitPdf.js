const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

module.exports.splitPdf = async (filePath, reverseEvenPages = true) => {
  try {
    // Read the input PDF file
    const existingPdfBytes = fs.readFileSync(filePath);

    // Load the PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalPages = pdfDoc.getPageCount();

    // Create new PDF documents for odd and even pages
    const oddPdfDoc = await PDFDocument.create();
    const evenPdfDoc = await PDFDocument.create();
    const evenPages = [];

    // Helper function to copy pages
    const copyPage = async (sourceDoc, targetDoc, pageIndex) => {
      const [copiedPage] = await targetDoc.copyPages(sourceDoc, [pageIndex]);
      return copiedPage;
    };

    // Split pages into odd and even
    for (let i = 0; i < totalPages; i++) {
      if (i % 2 === 0) {
        // 0-based index: i is odd if (i % 2 === 0)
        const copiedPage = await copyPage(pdfDoc, oddPdfDoc, i);
        oddPdfDoc.addPage(copiedPage);
      } else {
        const copiedPage = await copyPage(pdfDoc, evenPdfDoc, i);
        evenPages.push(copiedPage);
      }
    }

    // Add even pages to the evenPdfDoc (reverse if needed)
    const pagesToAdd = reverseEvenPages ? evenPages.reverse() : evenPages;
    pagesToAdd.forEach((page) => evenPdfDoc.addPage(page));

    // Serialize the PDFs and save them
    fs.writeFileSync("odd_pages.pdf", await oddPdfDoc.save());
    fs.writeFileSync("even_pages.pdf", await evenPdfDoc.save());

    console.log("PDFs have been created: odd_pages.pdf and even_pages.pdf");
  } catch (error) {
    console.error("An error occurred while splitting the PDF:", error);
  }
};
