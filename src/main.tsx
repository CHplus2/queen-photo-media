import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeLanguage } from './i18n/runtime';

initializeLanguage().finally(() =>
  createRoot(document.getElementById('root')!).render(<App />),
);
