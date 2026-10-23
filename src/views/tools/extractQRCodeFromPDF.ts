export const extractQRCodeFromPDF = async (pdfData: Uint8Array, pageNumber: number | 'lastPage') => {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  const { default: jsQR } = await import('jsqr');
  GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

  const loadingTask = getDocument({ data: pdfData });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber === 'lastPage' ? pdfDoc.numPages : pageNumber); // 1-sahifani olish

  // Skaner qilingan hujjatlarda QR kod 1x o'lchamda juda mayda chiqib, o'qilmay qoladi.
  // Shuning uchun avval 1x, topilmasa kattaroq o'lchamlarda qayta urinamiz.
  for (const scale of [1, 2, 3]) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Canvasni sahifa hajmiga moslashtirish
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Sahifani canvasga render qilish
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Canvasdan tasvirni olish va QR kodni o'qish
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

    if (qrCode) return { ok: true, result: qrCode.data };
  }

  return { ok: false, message: 'QR Code topilmadi.' };
};
