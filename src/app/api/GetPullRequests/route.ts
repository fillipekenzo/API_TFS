import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, project, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, senha } = body;

    if (!tfsURL || !collection || !project) {
      throw new Error("Configurações TFS não encontradas");
    }

    const credentials: NtlmCredentials = {
      username: usuario,
      password: senha,
      domain: DOMINIO,
    };

    const client = NtlmClient(credentials);
    const response = await client.get(
      `${tfsURL}/${collection}/${project}/_apis/git/pullrequests?searchCriteria.status=completed&$top=100&api-version=7.0`
    );

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Erro ao buscar pull requests" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error(
      "Erro ao buscar pull requests:",
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
