export {};

declare global {
  interface Window {
    saochepnative: (value: string) => void;
  }
}

declare module "swagger-ui-dist" {
  export const SwaggerUIBundle: (config: Record<string, unknown>) => {
    destroy?: () => void;
  };
}
