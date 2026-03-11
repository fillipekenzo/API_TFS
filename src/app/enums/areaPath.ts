export interface AreaPathNode {
  id: number;
  identifier: string;
  name: string;
  value: string;
  structureType: string;
  hasChildren: boolean;
  children?: AreaPathNode[];
}

export const areaPath: AreaPathNode[] = [
  {
    id: 4981,
    identifier: "e8932cef-1486-41e5-9d09-1ce627618c3a",
    name: "Área de Negócios",
    value: "CSIS-G08\\Área de Negócios",
    structureType: "area",
    hasChildren: true,
    children: [],
  },
  {
    id: 736,
    identifier: "17f3eeca-0afd-4ba2-aca2-b4c86f796222",
    name: "CSIS-G08",
    value: "CSIS-G08 Team\\CSIS-G08",
    structureType: "area",
    hasChildren: true,
    children: [],
  },
  {
    id: 1152,
    identifier: "ee2f20ab-9b06-4dea-8362-bef4d655d5e1",
    name: "Suporte",
    value: "CSIS-G08\\Suporte",
    structureType: "area",
    hasChildren: true,
    children: [],
  },
];
