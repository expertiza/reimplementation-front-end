declare module 'vitest' {
  export const vi: {
    fn: () => any;
    mock: (moduleName: string, factory?: () => any) => void;
    spyOn: (obj: any, method: string) => any;
    importActual: (moduleName: string) => Promise<any>;
  };
} 