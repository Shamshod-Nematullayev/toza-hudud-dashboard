import jsQR from 'jsqr';
import * as pdfjsLib from 'pdfjs-dist';

export const extractQRCodeFromPDF = async (pdfData: Uint8Array, pageNumber: number | 'lastPage') => {
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber === 'lastPage' ? pdfDoc.numPages : pageNumber); // 1-sahifani olish

  const viewport = page.getViewport({ scale: 1 }); // Sahifani ko'rsatish uchun viewportni olish
  const canvas = document.createElement('canvas'); // Yangi canvas yaratish
  const context = canvas.getContext('2d');

  // Canvasni sahifa hajmiga moslashtirish
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Sahifani canvasga render qilish
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  // Canvasdan tasvirni olish
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // QR kodni o'qish
  const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

  if (qrCode) {
    return { ok: true, result: qrCode.data };
  } else {
    return { ok: false, message: 'QR Code topilmadi.' };
  }
};
