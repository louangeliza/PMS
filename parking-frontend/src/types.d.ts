// src/types.d.ts
declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

interface ImportMeta {
  env: {
    VITE_API_URL?: string;
  };
}
