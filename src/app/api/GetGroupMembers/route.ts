import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, groupId, groupScope, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, senha, groupId: reqGroupId, scope: reqScope } = body;

    if (!tfsURL || !collection) {
      throw new Error("Configurações TFS não encontradas");
    }

    // Usa o groupId e scope da requisição ou do config
    const groupIdToUse = reqGroupId || groupId;
    const scopeToUse = reqScope || groupScope;
    
    if (!groupIdToUse || !scopeToUse) {
      return NextResponse.json(
        {
          success: false,
          message: "GroupId e Scope são obrigatórios",
        },
        { status: 400 }
      );
    }

    const credentials: NtlmCredentials = {
      username: usuario,
      password: senha,
      domain: DOMINIO,
    };

    // Constrói a URL usando o endpoint ReadGroupMembers
    const url = `${tfsURL}/${collection}/${groupIdToUse}/_api/_identity/ReadGroupMembers?__v=5&scope=${scopeToUse}&readMembers=true&scopedMembershipQuery=1`;

    const client = NtlmClient(credentials);
    const response = await client.get(url);

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Erro ao buscar membros do grupo" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error(
      "Erro ao buscar membros do grupo:",
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
