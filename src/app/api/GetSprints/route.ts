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

    // URL para buscar iterações (sprints) do time
    const teamName = encodeURIComponent(`${project} Team`);
    const url = `${tfsURL}/${collection}/${project}/${teamName}/_apis/work/teamsettings/iterations?api-version=7.0`;

    const client = NtlmClient(credentials);
    const response = await client.get(url);

    if (response.status !== 200) {
      return NextResponse.json({ success: false, message: "Erro ao buscar sprints" }, { status: response.status });
    }

    // Filtrar para remover sprints futuras e ordenar pelas mais recentes (finishDate desc)
    const iterations = response.data?.value ?? [];
    const now = new Date();

    const filteredIterations = iterations.filter((it: any) => {
      const attrs = it.attributes || {};
      if (attrs.timeFrame) {
        return attrs.timeFrame !== "future";
      }
      // fallback: considerar futura se startDate > now
      const start = attrs.startDate ? new Date(attrs.startDate) : null;
      const finish = attrs.finishDate ? new Date(attrs.finishDate) : null;
      if (finish && finish < now) return true; // passada
      if (start && start <= now) return true; // atual
      return false;
    });

    filteredIterations.sort((a: any, b: any) => {
      const aDate = a.attributes?.finishDate ?? a.attributes?.startDate ?? null;
      const bDate = b.attributes?.finishDate ?? b.attributes?.startDate ?? null;
      const aTime = aDate ? new Date(aDate).getTime() : 0;
      const bTime = bDate ? new Date(bDate).getTime() : 0;
      return bTime - aTime;
    });

    // Pegar apenas as 5 sprints mais recentes
    const latestFive = filteredIterations.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        ...response.data,
        value: latestFive,
        count: latestFive.length,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar sprints:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Falha na autenticação. Verifique suas credenciais.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Erro interno do servidor",
      },
      { status: error.response?.status || 500 },
    );
  }
}
