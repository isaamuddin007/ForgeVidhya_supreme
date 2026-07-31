/// <reference types="vite/client" />

// Raw string imports — embedded standalone artifact HTML rendered in a
// sandboxed iframe (see lib/artifacts + components/ArtifactModal).
declare module "*.html?raw" {
  const content: string;
  export default content;
}
