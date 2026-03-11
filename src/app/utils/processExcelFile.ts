import * as XLSX from "xlsx"; // Certifique-se de ter a biblioteca XLSX instalada

interface AdditionalParams {
  [key: string]: any; // Defina o tipo conforme necessário
}

export function processExcelFile(
  file: File,
  additionalParams: AdditionalParams
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Assumindo que a primeira linha do JSON contém os nomes das colunas
        const headers = jsonData[0] as string[];
        const tasks = jsonData.slice(1).map((row: unknown) => {
          let task = { ...additionalParams };
          headers.forEach((header: string, index: number) => {
            task[header] = (row as any[])[index];
          });
          return task;
        });

        resolve(tasks);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
