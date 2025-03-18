import { createRoot } from 'react-dom/client';

// project imports
import App from './App';

import * as pdfjsLib from 'pdfjs-dist';

// pdf.js worker-ni o'chirish (agar worker kerak bo'lmasa)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

// google-fonts
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/700.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// style + assets
import 'assets/scss/style.scss';
import reportWebVitals from 'reportWebVitals';
import { socket } from 'utils/socket';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript

// ==============================|| REACT DOM RENDER  ||============================== //

socket.on('connection', (data) => console.log(data));
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
reportWebVitals();
