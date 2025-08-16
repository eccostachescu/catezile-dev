import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import international leagues on app load
import './scripts/import-international';

createRoot(document.getElementById("root")!).render(<App />);
