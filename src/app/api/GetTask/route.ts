import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, project, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const pbi = searchParams.get("pbi");

        if (!pbi) {
            return NextResponse.json(
                { success: false, message: "PBI não informado na URL" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { usuario, senha } = body[0].value;

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
            `${tfsURL}/${collection}/_apis/wit/workitems/${pbi}?api-version=7.0`
        );

        if (response.status !== 200) {
            return NextResponse.json(
                { success: false, message: "Erro ao buscar PBI" },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            data: response.data,
        });
    } catch (error: any) {
        console.error(
            "Erro ao buscar PBI:",
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
                    error.response?.data?.message || "Erro interno ao buscar o PBI.",
            },
            { status: error.response?.status || 500 }
        );
    }
}
