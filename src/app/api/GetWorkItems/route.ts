import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, project, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, senha, query: customQuery } = body;

    if (!tfsURL || !collection || !project) {
      throw new Error("Configurações TFS não encontradas");
    }

    if (!usuario || !senha) {
      return NextResponse.json(
        { success: false, message: "Usuário e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const credentials: NtlmCredentials = {
      username: usuario,
      password: senha,
      domain: DOMINIO,
    };

    const query =
      customQuery ||
      `SELECT [System.Id], [System.Title], [System.State], [System.AreaPath] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.WorkItemType] = 'Product Backlog Item' AND [System.AreaPath] = '${project}\\\\Área de Negócios'`;

    const client = NtlmClient(credentials);
    const response = await client.post(
      `${tfsURL}/${collection}/${project}/_apis/wit/wiql?api-version=7.0`,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Erro ao executar query WIQL" },
        { status: response.status }
      );
    }

    const wiqlResult = response.data;
    const workItemRefs = wiqlResult?.workItems ?? [];
    const ids = workItemRefs.map((wi: { id: number }) => wi.id);

    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: { workItems: [], workItemRefs: [] },
      });
    }

    const idsParam = ids.slice(0, 200).join(",");
    const workItemsResponse = await client.get(
      `${tfsURL}/${collection}/${project}/_apis/wit/workitems?ids=${idsParam}&api-version=7.0`
    );

    const workItems = workItemsResponse.data?.value ?? [];

    return NextResponse.json({
      success: true,
      data: {
        workItems,
        workItemRefs,
        queryResult: wiqlResult,
      },
    });
  } catch (error: any) {
    console.error(
      "Erro ao buscar work items (WIQL):",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Falha na autenticação. Verifique suas credenciais.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || "Erro interno do servidor",
      },
      { status: error.response?.status || 500 }
    );
  }
}
