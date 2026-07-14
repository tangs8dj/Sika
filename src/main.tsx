import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@arco-design/web-react/dist/css/arco.css';
import { App } from './app/App';
import './app/App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
