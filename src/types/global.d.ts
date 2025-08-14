// Global type declarations
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

export {};