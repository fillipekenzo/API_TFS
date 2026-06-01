import * as XLSX from "xlsx";

interface AdditionalParams {
  [key: string]: any;
}

const HEADER_ALIASES: Record<string, string> = {
  title: "title",
  titulo: "title",
  description: "description",
  descricao: "description",
  pbi: "pbi",
  activityid: "activityId",
  "id atividade": "activityId",
  lancamentoatividadeid: "activityId",
  activity: "activity",
  atividade: "activity",
  atividadeust: "activity",
  complexity: "complexity",
  complexidade: "complexity",
  complexidadeust: "complexity",
  areapath: "areaPath",
  area: "areaPath",
};

function normalizeHeader(header: unknown): string {
  if (header == null || header === "") return "";
  const raw = String(header).trim().toLowerCase();
  const withoutAccents = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return HEADER_ALIASES[withoutAccents] ?? withoutAccents.replace(/\s+/g, "");
}

function cellValue(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function rowHasData(row: unknown[]): boolean {
  return row.some((cell) => cellValue(cell) !== "");
}

export function processExcelFile(
  file: File,
  additionalParams: AdditionalParams,
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (!result) {
          reject(new Error("Arquivo vazio"));
          return;
        }

        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          reject(new Error("Planilha não encontrada"));
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        if (!jsonData.length) {
          resolve([]);
          return;
        }

        const headerRow = jsonData[0] as unknown[];
        const normalizedHeaders = headerRow.map(normalizeHeader);

        if (!normalizedHeaders.some(Boolean)) {
          reject(new Error("Cabeçalho da planilha não encontrado"));
          return;
        }

        const tasks = jsonData
          .slice(1)
          .filter((row): row is unknown[] => Array.isArray(row) && rowHasData(row))
          .map((row) => {
            const task: Record<string, string> = { ...additionalParams };

            normalizedHeaders.forEach((header, index) => {
              if (!header) return;
              task[header] = cellValue(row[index]);
            });

            return task;
          })
          .filter((task) => task.title || task.pbi);

        resolve(tasks);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsArrayBuffer(file);
  });
}
