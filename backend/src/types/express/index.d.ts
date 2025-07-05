// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      account?: {
        id: string;
        username: string;
        email: string;
        name: string | null;
      };
    }
  }
}
