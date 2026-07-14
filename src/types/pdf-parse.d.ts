declare module "pdf-parse" {
  interface PDFParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: Record<string, any>;
    version: string;
  }
  function pdfParse(dataBuffer: Buffer): Promise<PDFParseResult>;
  export default pdfParse;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse";
  export default pdfParse;
}
