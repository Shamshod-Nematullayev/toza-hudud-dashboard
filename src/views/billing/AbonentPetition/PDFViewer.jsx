import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;
// Worker ni CDN orqali ulash
import './PDFViewer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Grid } from '@mui/material';

const PdfViewer = ({ base64String }) => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.23); // 80% ekrandan

  useEffect(() => {
    if (base64String) {
      setPdfData(`${base64String}`);
    }

    const handleResize = () => {
      setContainerWidth(window.innerWidth * 0.3);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [base64String]);

  return (
    <Grid container sx={{}} className="pdf-container">
      {loading && <p className="loading-text">📄 PDF yuklanmoqda...</p>}

      {pdfData && (
        <>
          <Document
            file={pdfData}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setLoading(false); // ⬅️ Faqat yuklanganidan keyin o‘chiramiz
            }}
            className="pdf-document"
          >
            <Page pageNumber={pageNumber} className="pdf-page" width={containerWidth} />
          </Document>

          <div className="navigation">
            <button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>
              ◀️ Orqaga
            </button>
            <span className="page-info">
              {pageNumber} / {numPages}
            </span>
            <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(pageNumber + 1)}>
              Oldinga ▶️
            </button>
          </div>
        </>
      )}
    </Grid>
  );
};

export default PdfViewer;
