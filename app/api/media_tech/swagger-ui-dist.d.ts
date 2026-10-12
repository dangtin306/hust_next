declare module "swagger-ui-dist" {
  type SwaggerUIInstance = {
    destroy?: () => void;
    preauthorizeApiKey?: (key: string, value: string) => void;
  };

  type SwaggerUIBundleFunction = (options: Record<string, unknown>) => SwaggerUIInstance;

  export const SwaggerUIBundle: SwaggerUIBundleFunction;

  const swaggerUiDist: {
    SwaggerUIBundle?: SwaggerUIBundleFunction;
  };

  export default swaggerUiDist;
}
