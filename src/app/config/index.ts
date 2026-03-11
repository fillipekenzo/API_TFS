const dev = process.env.NEXT_PUBLIC_SERVER;
export const server = dev;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export const backendURL = process.env.NEXT_PUBLIC_BASEURL_API;
export const tfsURL =
  process.env.NEXT_PUBLIC_TFS_URL || "https://tfs.sgi.ms.gov.br/tfs";
export const collection = process.env.NEXT_PUBLIC_COLLECTION || "Global";
export const project = process.env.NEXT_PUBLIC_PROJECT || "CSIS-G08";
export const contrato =
  process.env.NEXT_PUBLIC_CONTRACT || "056/2021 - 16811 - SEFAZ - MIL TEC";
export const USERNAME = process.env.NEXT_PUBLIC_USERNAME || "";
export const PASSWORD = process.env.NEXT_PUBLIC_PASSWORD || "";
export const DOMINIO = process.env.NEXT_PUBLIC_DOMAIN || "FAZENDA";
export const organization = process.env.NEXT_PUBLIC_ORGANIZATION || "";
export const groupId = process.env.NEXT_PUBLIC_GROUP_ID || "df245d88-3587-451d-8c8b-bca7fee7f98d";
export const groupScope = process.env.NEXT_PUBLIC_GROUP_SCOPE || "5e501fc1-6956-480f-847e-95b2fce90415";
