/// <reference types="vite/client" />

// Raw string imports (e.g. embedded standalone tool HTML rendered in an iframe).
declare module "*.html?raw" {
  const content: string;
  export default content;
}
