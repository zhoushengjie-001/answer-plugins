export interface Request {
  get: (url: string) => Promise<any>;
}