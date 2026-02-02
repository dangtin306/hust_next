export {};

declare global {
  interface Window {
    saochepnative: (value: string) => void;
  }
}
