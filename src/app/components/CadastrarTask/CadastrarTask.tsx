"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Form, Button, message, Select, Input } from "antd";
import Style from "./style.module.scss";
import SelectComponent from "../Select/Select";
import InputComponent from "../Input/Input";
import DateSelectorComponent from "../DateSelector/DateSelector";
import InputFileComponent from "../InputFile/InputFile";
import ModalLoginGSI from "../ModalLoginGSI/ModalLoginGSI";
import fetchClient from "@/app/utils/routesHelper/fetchClient";
import { contrato, project } from "@/app/config";
import { processExcelFile } from "@/app/utils/processExcelFile";
import { format } from "date-fns";
import { taskTemplates } from "@/app/enums/taskTemplates";
import { tipoTarefas } from "@/app/enums/tipoTarefas";
import { times } from "@/app/enums/times";
import { areaPath } from "@/app/enums/areaPath";
import { decryptPassword } from "@/app/utils/encryption";

export default function CadastrarTask() {
  const [form] = Form.useForm();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [taskExcel, setTaskExcel] = useState<any>(null);
  const [areaPathPBI, setAreaPathPBI] = useState<any>(null);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupMembersOptions, setGroupMembersOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [savedUser, setSavedUser] = useState<{
    usuario: string;
    senha: string;
  } | null>(null);
  const [sprints, setSprints] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [workItems, setWorkItems] = useState<any[]>([]);
  const pendingSubmitRef = useRef<any>(null);

  const tipoTarefa = Form.useWatch("tipoTarefa", form);
  const selectedSprint = Form.useWatch("sprint", form);
  const selectedAreaPath = Form.useWatch("areaPathPBI", form);

  const areaPathOptions: { value: string; label: string }[] = areaPath.map(
    (node) => ({
      value: `${node.value}`,
      label: node.name,
    }),
  );

  const pbiOptions: { value: string; label: string }[] = useMemo(() => {
    if (!workItems?.length) return [];
    return workItems.map((wi: any) => ({
      value: String(wi.id),
      label: `${wi.id} - ${wi.fields?.["System.Title"] ?? ""}`.trim(),
    }));
  }, [workItems]);

  const fetchWorkItems = async (
    usuario: string,
    senha: string,
    areaPathValue: string,
    sprintValue: string,
  ) => {
    try {
      const iterationPath = `${areaPathValue}\\${sprintValue}`;
      const escapedAreaPath = areaPathValue.replace(/'/g, "''");
      const isAreaDeNegocios = areaPathValue.includes("Área de Negócios");
      const areaPathCondition = isAreaDeNegocios
        ? `([System.AreaPath] = '${escapedAreaPath}' OR [System.AreaPath] = 'CSIS-G08\\Área de Negócios\\Daily Scrum')`
        : `[System.AreaPath] = '${escapedAreaPath}'`;
      const query = `SELECT [System.Id], [System.Title], [System.State], [System.AreaPath] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.WorkItemType] = 'Product Backlog Item' AND ${areaPathCondition} AND [System.IterationPath] = '${iterationPath.replace(/'/g, "''")}' AND [System.State] <> 'Removed' AND [System.State] <> 'Closed'`;
      const response = await fetchClient(`/api/GetWorkItems`, {
        method: "POST",
        body: JSON.stringify({
          usuario,
          senha,
          query,
        }),
      });
      if (response.success && response.data?.workItems) {
        setWorkItems(response.data.workItems);
      } else {
        setWorkItems([]);
      }
    } catch (error) {
      setWorkItems([]);
    }
  };

  useEffect(() => {
    if (savedUser && selectedSprint && selectedAreaPath) {
      fetchWorkItems(
        savedUser.usuario,
        savedUser.senha,
        selectedAreaPath,
        selectedSprint,
      );
    } else {
      setWorkItems([]);
      const currentPbi = form.getFieldValue("pbi");
      if (
        currentPbi !== undefined &&
        currentPbi !== null &&
        currentPbi !== ""
      ) {
        form.setFieldValue("pbi", undefined);
      }
    }
  }, [savedUser, selectedSprint, selectedAreaPath]);

  useEffect(() => {
    if (
      tipoTarefa === "feedback-colaborador" &&
      savedUser &&
      groupMembersOptions.length === 0
    ) {
      fetchGroupMembers(savedUser.usuario, savedUser.senha);
    }
    // Não incluir groupMembersOptions: ao preencher após o fetch, o efeito não deve rodar de novo
  }, [tipoTarefa, savedUser]);

  const fetchSprints = async (usuario: string, senha: string) => {
    try {
      const response = await fetchClient(`/api/GetSprints`, {
        method: "POST",
        body: JSON.stringify({
          usuario,
          senha,
        }),
      });

      if (response.success && response.data?.value) {
        const sprintsData = response.data.value.map((iteration: any) => {
          const sprintName =
            iteration.path?.split("\\").pop() || iteration.name || "Sprint";
          return {
            value: sprintName,
            label: sprintName,
          };
        });
        const num = (s: { value: string }) =>
          parseInt(s.value.replace(/\D/g, ""), 10) || 0;
        sprintsData.sort(
          (a: { value: string }, b: { value: string }) => num(b) - num(a),
        );
        setSprints(sprintsData);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = sessionStorage.getItem("tfs_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const decryptedPassword = decryptPassword(user.senha);
          const decryptedUser = {
            usuario: user.usuario,
            senha: decryptedPassword,
          };
          setSavedUser(decryptedUser);
          fetchSprints(decryptedUser.usuario, decryptedUser.senha);
          fetchGroupMembers(decryptedUser.usuario, decryptedUser.senha);
        } catch (error) {}
      }
    }
  }, []);

  const handleSubmit = async (values: any) => {
    const dates =
      Array.isArray(values.data) && values.data.length > 0
        ? values.data
        : selectedDates;

    let payload: any = { ...values, data: dates };
    const tipoTarefaValue = values.tipoTarefa || tipoTarefa;

    if (tipoTarefaValue === "personalizado") {
      const file =
        values.arquivo instanceof File ? values.arquivo : null;
      if (!file) {
        message.warning("Selecione um arquivo para tarefas personalizadas.");
        return;
      }
      try {
        const tasks = await processExcelFile(file, {});
        if (!tasks.length) {
          message.warning(
            "Nenhuma tarefa encontrada no arquivo. Verifique o cabeçalho e as linhas.",
          );
          return;
        }
        setTaskExcel(tasks);
        payload = { ...payload, excelTasks: tasks };
      } catch {
        message.error(
          "Erro ao ler o arquivo. Verifique se é Excel (.xlsx) ou CSV válido.",
        );
        return;
      }
    }

    if (!dates.length) {
      message.warning("Selecione pelo menos uma data.");
      return;
    }

    payload.tipoTarefa = tipoTarefaValue;
    pendingSubmitRef.current = payload;
    setFormValues(payload);
    setLoading(true);

    try {
      if (savedUser) {
        await handleLoginSuccess(savedUser, payload);
      } else {
        setIsModalOpen(true);
      }
    } catch (error) {
      message.error("Erro ao processar formulário.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (usuario: string, senha: string) => {
    try {
      const response = await fetchClient(`/api/GetGroupMembers`, {
        method: "POST",
        body: JSON.stringify({
          usuario,
          senha,
          maxResults: 100,
        }),
      });

      if (response.success && response.data?.identities) {
        setGroupMembers(response.data.identities);

        const membersOptions = response.data.identities.map((identity: any) => {
          const friendlyName =
            identity.FriendlyDisplayName ||
            identity.DisplayName ||
            identity.name ||
            "Sem nome";
          return {
            value: friendlyName,
            label: friendlyName,
          };
        });

        setGroupMembersOptions(membersOptions);
      }
    } catch (error) {}
  };

  const fetchPullRequests = async (
    usuario: string,
    senha: string,
    submittedFormValues?: any,
  ) => {
    try {
      const fv = submittedFormValues || formValues;
      const response = await fetchClient(`/api/GetPullRequests`, {
        method: "POST",
        body: JSON.stringify({
          usuario,
          senha,
        }),
      });

      if (response.success && response.data?.value) {
        let filteredPRs = response.data.value;

        if (selectedDates.length > 0) {
          const selectedDatesOnly = selectedDates.map((date: Date) => {
            const d = new Date(date);
            return new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate(),
            ).getTime();
          });

          filteredPRs = response.data.value.filter((pr: any) => {
            if (!pr.creationDate) return false;

            const prDate = new Date(pr.creationDate);
            const prDateOnly = new Date(
              prDate.getFullYear(),
              prDate.getMonth(),
              prDate.getDate(),
            ).getTime();

            return selectedDatesOnly.includes(prDateOnly);
          });
        }

        setPullRequests(filteredPRs);
        message.success(
          `${filteredPRs.length} pull requests encontrados${selectedDates.length > 0 ? " para as datas selecionadas" : ""}`,
        );

        if (
          filteredPRs.length > 0 &&
          fv?.tipoTarefa === "analisepr" &&
          selectedDates.length > 0
        ) {
          await createTasksFromPullRequests(filteredPRs, usuario, senha, fv);
        }
      } else {
        message.error("Erro ao buscar pull requests");
      }
    } catch (error) {
      message.error("Erro ao buscar pull requests");
    }
  };

  const createTasksFromPullRequests = async (
    prs: any[],
    usuario: string,
    senha: string,
    submittedFormValues?: any,
  ) => {
    try {
      const fv = submittedFormValues || formValues;
      if (!fv || !usuario || !senha) {
        message.error("Dados do formulário não encontrados");
        return;
      }

      const promises = prs.map(async (pr: any) => {
        const prDate = new Date(pr.creationDate);
        const prDateISO = prDate.toISOString();

        const taskTemplateResult = taskTemplates["avaliacaopr"]({
          pullRequest: pr,
        });
        const tasks = Array.isArray(taskTemplateResult)
          ? taskTemplateResult
          : [taskTemplateResult];

        if (tasks.length === 0) {
          return { success: false };
        }

        const taskData = tasks[0];

        const bodyJson = JSON.stringify([
          {
            op: "add",
            path: "/fields/System.Credentials",
            value: {
              usuario,
              senha,
            },
          },
          {
            op: "add",
            path: "/relations/-",
            value: {
              rel: "System.LinkTypes.Hierarchy-Reverse",
              url: `https://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${fv.pbi}`,
            },
          },
          {
            op: "add",
            path: "/fields/System.Title",
            value: taskData.title,
          },
          {
            op: "add",
            path: "/fields/System.Description",
            value: taskData.description,
          },
          {
            op: "add",
            path: "/fields/System.State",
            value: "To Do",
          },
          {
            op: "add",
            path: "/fields/System.AreaPath",
            value: `${project}\\${taskData.areaPath}`,
          },
          {
            op: "add",
            path: "/fields/System.IterationPath",
            value: `${project}\\Área de Negócios\\${fv.sprint}`,
          },
          {
            op: "add",
            path: "/fields/System.AssignedTo",
            value: fv.integrante,
          },
          {
            op: "add",
            path: "/fields/Custom.SGI.Empresa",
            value: contrato,
          },
          {
            op: "add",
            path: "/fields/Custom.SGI.LancamentoAtividadeID",
            value: taskData.activityId,
          },
          {
            op: "add",
            path: "/fields/Custom.SGI.AtividadeUST",
            value: taskData.activity,
          },
          {
            op: "add",
            path: "/fields/Custom.SGI.ComplexidadeUST",
            value: taskData.complexity,
          },
          {
            op: "add",
            path: "/fields/System.CreatedDate",
            value: prDateISO,
          },
          {
            op: "add",
            path: "/fields/Custom.SGI.DataExecucao",
            value: prDateISO,
          },
        ]);
        return fetchClient(`/api/Task`, {
          method: "POST",
          body: bodyJson,
        });
      });

      const results = await Promise.all(promises);
      const successCount = results.filter((resp) => resp?.success).length;

      if (successCount === prs.length) {
        message.success(`${successCount} tarefas criadas com sucesso!`);
      } else {
        message.warning(
          `${successCount} de ${prs.length} tarefas criadas com sucesso.`,
        );
      }
    } catch (error) {
      message.error("Erro ao criar tarefas a partir dos pull requests");
    }
  };

  const handleLoginSuccess = async (values: any, submittedFormValues?: any) => {
    setLoading(true);
    try {
      const fv = submittedFormValues || formValues;
      await fetchSprints(values.usuario, values.senha);

      if (fv?.tipoTarefa === "analisepr") {
        await Promise.all([
          fetchGroupMembers(values.usuario, values.senha),
          fetchPullRequests(values.usuario, values.senha, fv),
        ]);
      } else {
        let excelTasks: any[] | null =
          fv.tipoTarefa === "personalizado"
            ? fv.excelTasks ?? taskExcel
            : null;

        if (fv.tipoTarefa === "personalizado" && !excelTasks?.length) {
          message.warning(
            "Carregue um arquivo com tarefas (colunas: title, description, pbi, activityId, activity, complexity).",
          );
          return;
        }

        const dates = fv.data
          .slice()
          .sort(
            (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime(),
          );
        for (const d of dates) {
          const date = new Date(d);
          const formattedDate = format(date, "dd/MM");
          const fullDate = format(date, "dd/MM/yyyy");
          const previousDayDate = new Date(date);
          previousDayDate.setDate(previousDayDate.getDate() - 1);
          while (
            previousDayDate.getDay() === 0 ||
            previousDayDate.getDay() === 6
          ) {
            previousDayDate.setDate(previousDayDate.getDate() - 1);
          }
          const previousDay = format(previousDayDate, "dd/MM");
          const dISO = date.toISOString();

          if (
            fv.tipoTarefa === "personalizado" &&
            excelTasks != null &&
            excelTasks.length > 0
          ) {
            const areaPathValue =
              fv.areaPathPBI || `${project}\\Área de Negócios`;
            const iterationPathValue = `${fv.areaPathPBI || project}\\${fv.sprint}`;

            const results: Awaited<ReturnType<typeof fetchClient>>[] = [];

            for (const t of excelTasks) {
              const title = (t.title ?? "")
                .replace("{dd/MM/yyyy}", fullDate)
                .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
                .replace("{dd/MM}", formattedDate)
                .replace("{pbi}", String(t.pbi ?? ""))
                .replace("{sprint}", fv.sprint);

              const description = (t.description ?? "")
                .replace("{dd/MM/yyyy}", fullDate)
                .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
                .replace("{dd/MM}", formattedDate)
                .replace("{pbi}", String(t.pbi ?? ""))
                .replace("{sprint}", fv.sprint);

              const bodyJson = JSON.stringify([
                {
                  op: "add",
                  path: "/fields/System.Credentials",
                  value: {
                    usuario: values.usuario,
                    senha: values.senha,
                  },
                },
                {
                  op: "add",
                  path: "/relations/-",
                  value: {
                    rel: "System.LinkTypes.Hierarchy-Reverse",
                    url: `https://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${t.pbi}`,
                  },
                },
                {
                  op: "add",
                  path: "/fields/System.Title",
                  value: title,
                },
                {
                  op: "add",
                  path: "/fields/System.Description",
                  value: description,
                },
                {
                  op: "add",
                  path: "/fields/System.State",
                  value: "To Do",
                },
                {
                  op: "add",
                  path: "/fields/System.AreaPath",
                  value: areaPathValue,
                },
                {
                  op: "add",
                  path: "/fields/System.IterationPath",
                  value: iterationPathValue,
                },
                {
                  op: "add",
                  path: "/fields/System.AssignedTo",
                  value: fv.integrante,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.Empresa",
                  value: contrato,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.LancamentoAtividadeID",
                  value: t.activityId,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.AtividadeUST",
                  value: t.activity,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.ComplexidadeUST",
                  value: t.complexity,
                },
                {
                  op: "add",
                  path: "/fields/System.CreatedDate",
                  value: dISO,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.DataExecucao",
                  value: dISO,
                },
              ]);

              const response = await fetchClient(`/api/Task`, {
                method: "POST",
                body: bodyJson,
              });
              results.push(response);
            }

            const success = results.every((resp) => resp?.success);

            if (success) {
              message.success("Todas as tasks foram cadastradas com sucesso!");
            } else {
              message.error("Erro ao cadastrar algumas tasks.");
            }
          } else if (fv.tipoTarefa !== "personalizado") {
            let tasks: any[];
            if (fv.tipoTarefa === "feedback-colaborador") {
              const colaboradores = Array.isArray(fv.colaboradores)
                ? fv.colaboradores
                : [];
              if (colaboradores.length === 0) {
                message.warning(
                  "Selecione pelo menos um colaborador para Feedback por colaborador.",
                );
                break;
              }
              const base = taskTemplates[fv.tipoTarefa]()[0];
              tasks = colaboradores.map((colab: string) => ({
                ...base,
                title: base.title.replace(/{colaborador}/g, colab),
                description: base.description.replace(/{colaborador}/g, colab),
              }));
            } else {
              const taskTemplateResult = taskTemplates[fv.tipoTarefa]();
              tasks = Array.isArray(taskTemplateResult)
                ? taskTemplateResult
                : [taskTemplateResult];
            }

            if (fv.tipoTarefa === "refinamento") {
              const pbisRelacionadas = (fv.pbisRelacionadas ?? "").trim();
              if (!pbisRelacionadas) {
                message.warning(
                  "Informe as PBIs Relacionadas para o tipo Refinamento.",
                );
                break;
              }

              const pbiIds = pbisRelacionadas
                .split(/\r?\n/)
                .map((s: string) => s.trim())
                .filter(Boolean);

              const templateRefinamento = taskTemplates.refinamento()[0];
              let createdRefinamento = 0;

              for (const pbiId of pbiIds) {
                try {
                  const resp = await fetchClient(`/api/GetTask?pbi=${pbiId}`, {
                    method: "POST",
                    body: JSON.stringify([
                      {
                        op: "add",
                        path: "/fields/System.Credentials",
                        value: {
                          usuario: values.usuario,
                          senha: values.senha,
                        },
                      },
                    ]),
                  });

                  if (!resp?.success || !resp.data) {
                    message.warning(
                      `PBI ${pbiId} não encontrada ou erro na busca.`,
                    );
                    continue;
                  }

                  const pbiTitle = resp.data.fields?.["System.Title"] ?? "";
                  const pbiDesc =
                    resp.data.fields?.["System.Description"] ?? "";
                  const title = `${formattedDate} - REFINAMENTO | ${pbiId} | ${pbiTitle}`;

                  const bodyJson = JSON.stringify([
                    {
                      op: "add",
                      path: "/fields/System.Credentials",
                      value: {
                        usuario: values.usuario,
                        senha: values.senha,
                      },
                    },
                    {
                      op: "add",
                      path: "/relations/-",
                      value: {
                        rel: "System.LinkTypes.Hierarchy-Reverse",
                        url: `https://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${fv.pbi}`,
                      },
                    },
                    {
                      op: "add",
                      path: "/fields/System.Title",
                      value: title,
                    },
                    {
                      op: "add",
                      path: "/fields/System.Description",
                      value: pbiDesc,
                    },
                    {
                      op: "add",
                      path: "/fields/System.State",
                      value: "To Do",
                    },
                    {
                      op: "add",
                      path: "/fields/System.AreaPath",
                      value:
                        fv.areaPathPBI ||
                        `${project}\\${templateRefinamento.areaPath}`,
                    },
                    {
                      op: "add",
                      path: "/fields/System.IterationPath",
                      value: `${project}\\Área de Negócios\\${fv.sprint}`,
                    },
                    {
                      op: "add",
                      path: "/fields/System.AssignedTo",
                      value: fv.integrante,
                    },
                    {
                      op: "add",
                      path: "/fields/Custom.SGI.Empresa",
                      value: contrato,
                    },
                    {
                      op: "add",
                      path: "/fields/Custom.SGI.LancamentoAtividadeID",
                      value: templateRefinamento.activityId,
                    },
                    {
                      op: "add",
                      path: "/fields/Custom.SGI.AtividadeUST",
                      value: templateRefinamento.activity,
                    },
                    {
                      op: "add",
                      path: "/fields/Custom.SGI.ComplexidadeUST",
                      value: templateRefinamento.complexity,
                    },
                    {
                      op: "add",
                      path: "/fields/System.CreatedDate",
                      value: dISO,
                    },
                    {
                      op: "add",
                      path: "/fields/Custom.SGI.DataExecucao",
                      value: dISO,
                    },
                  ]);

                  const taskResp = await fetchClient(`/api/Task`, {
                    method: "POST",
                    body: bodyJson,
                  });

                  if (taskResp?.success) {
                    createdRefinamento++;
                  }
                } catch {
                  message.warning(`Erro ao processar PBI ${pbiId}.`);
                }
              }

              if (createdRefinamento > 0) {
                message.success(
                  `${createdRefinamento} tarefa(s) de refinamento criada(s).`,
                );
              }
              if (createdRefinamento < pbiIds.length) {
                message.warning(
                  `${pbiIds.length - createdRefinamento} PBI(s) não geraram task (não encontrada ou erro).`,
                );
              }
              break;
            }

            const selectedWorkItem = workItems.find(
              (wi: any) => String(wi.id) === String(fv.pbi),
            );
            const pbiTitulo = selectedWorkItem?.fields?.["System.Title"] ?? "";
            const pbiDescricao =
              selectedWorkItem?.fields?.["System.Description"] ?? "";
            const pbisRelacionadas = (fv.pbisRelacionadas ?? "").trim();

            for (const t of tasks) {
              const taskData = {
                ...t,
                title: t.title
                  .replace("{dd/MM/yyyy}", fullDate)
                  .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
                  .replace("{dd/MM}", formattedDate)
                  .replace("{pbi}", fv.pbi)
                  .replace("{pbi.titulo}", pbiTitulo)
                  .replace("{sprint}", fv.sprint),
                description: t.description
                  .replace("{dd/MM/yyyy}", fullDate)
                  .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
                  .replace("{dd/MM}", formattedDate)
                  .replace("{pbi}", fv.pbi)
                  .replace("{pbi.descricao}", pbiDescricao)
                  .replace("{pbi.relacionadas}", pbisRelacionadas)
                  .replace("{sprint}", fv.sprint),
              };

              const bodyJson = JSON.stringify([
                {
                  op: "add",
                  path: "/fields/System.Credentials",
                  value: {
                    usuario: values.usuario,
                    senha: values.senha,
                  },
                },
                {
                  op: "add",
                  path: "/relations/-",
                  value: {
                    rel: "System.LinkTypes.Hierarchy-Reverse",
                    url: `https://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${fv.pbi}`,
                  },
                },
                {
                  op: "add",
                  path: "/fields/System.Title",
                  value: taskData.title,
                },
                {
                  op: "add",
                  path: "/fields/System.Description",
                  value: taskData.description,
                },
                {
                  op: "add",
                  path: "/fields/System.State",
                  value: "To Do",
                },
                {
                  op: "add",
                  path: "/fields/System.AreaPath",
                  value: `${project}\\${taskData.areaPath}`,
                },
                {
                  op: "add",
                  path: "/fields/System.IterationPath",
                  value: `${project}\\Área de Negócios\\${fv.sprint}`,
                },
                {
                  op: "add",
                  path: "/fields/System.AssignedTo",
                  value: fv.integrante,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.Empresa",
                  value: contrato,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.LancamentoAtividadeID",
                  value: taskData.activityId,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.AtividadeUST",
                  value: taskData.activity,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.ComplexidadeUST",
                  value: taskData.complexity,
                },
                {
                  op: "add",
                  path: "/fields/System.CreatedDate",
                  value: dISO,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.DataExecucao",
                  value: dISO,
                },
              ]);

              const response = await fetchClient(`/api/Task`, {
                method: "POST",
                body: bodyJson,
              });

              if (response.success) {
                message.success("Task cadastrada com sucesso!");
              } else {
                message.error("Erro ao cadastrar a task.");
              }
            }
          }
        }
      }
    } catch (error) {
      message.error("Erro ao cadastrar.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (tipoTarefa !== "personalizado") {
      setTaskExcel(null);
    }
  }, [tipoTarefa]);

  const processArquivo = async (file: File | null) => {
    if (!file) {
      setTaskExcel(null);
      return;
    }
    try {
      const tasks = await processExcelFile(file, {});
      if (tasks.length === 0) {
        setTaskExcel(null);
        message.warning(
          "Nenhuma tarefa encontrada no arquivo. Verifique o cabeçalho e as linhas preenchidas.",
        );
        return;
      }
      setTaskExcel(tasks);
      message.success(`${tasks.length} tarefa(s) carregada(s) do arquivo.`);
    } catch {
      setTaskExcel(null);
      message.error(
        "Erro ao ler o arquivo. Use Excel (.xlsx) ou CSV com colunas: title, description, pbi, activityId, activity, complexity.",
      );
    }
  };

  const ArquivoUpload = ({
    value,
    onChange,
  }: {
    value?: File | null;
    onChange?: (file: File | null) => void;
  }) => (
    <InputFileComponent
      name="Arquivo"
      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      value={value ?? undefined}
      onChange={async (file) => {
        onChange?.(file);
        await processArquivo(file);
      }}
    />
  );

  return (
    <div className={Style.container}>
      <div className={Style.titleDiv}>
        <h1 className={Style.title}>Cadastrar Task</h1>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="grid grid-cols-3 gap-4"
      >
        <Form.Item
          name="tipoTarefa"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Tipo de Tarefa" options={tipoTarefas} />
        </Form.Item>

        <Form.Item
          name="sprint"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Sprint" options={sprints} />
        </Form.Item>

        <Form.Item
          name="areaPathPBI"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Área (Area Path)" options={areaPathOptions} />
        </Form.Item>

        {tipoTarefa != "personalizado" &&
          tipoTarefa !== "feedback-colaborador" && (
            <Form.Item
              name="pbi"
              rules={[{ required: true, message: "Campo obrigatório" }]}
            >
              {pbiOptions.length > 0 ? (
                <SelectComponent name="PBI" options={pbiOptions} />
              ) : (
                <InputComponent
                  name="PBI"
                  type="number"
                  nameForm={"pbi"}
                  form={form}
                  placeholder="Informe a PBI"
                />
              )}
            </Form.Item>
          )}

        {tipoTarefa === "feedback-colaborador" && (
          <>
            <Form.Item
              name="pbi"
              rules={[{ required: true, message: "Campo obrigatório" }]}
            >
              {pbiOptions.length > 0 ? (
                <SelectComponent name="PBI" options={pbiOptions} />
              ) : (
                <InputComponent
                  name="PBI"
                  type="number"
                  nameForm={"pbi"}
                  form={form}
                  placeholder="Informe a PBI"
                />
              )}
            </Form.Item>
            <Form.Item
              name="colaboradores"
              label="Colaboradores"
              rules={[
                {
                  required: true,
                  message: "Selecione pelo menos um colaborador",
                },
                {
                  type: "array",
                  min: 1,
                  message: "Selecione pelo menos um colaborador",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Selecione os colaboradores (1 ou mais)"
                options={groupMembersOptions}
                allowClear
                className="w-full"
                style={{ minWidth: 300 }}
              />
            </Form.Item>
          </>
        )}

        {tipoTarefa === "refinamento" && (
          <Form.Item
            name="pbisRelacionadas"
            label="PBIs Relacionadas"
            rules={[
              {
                required: true,
                message: "Informe as PBIs relacionadas",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Digite um ID de PBI por linha (ex.: 1243623, 1243624, 1243921)"
              allowClear
              className="w-full"
              rows={6}
              style={{ resize: "vertical" }}
            />
          </Form.Item>
        )}

        {tipoTarefa === "personalizado" && (
          <Form.Item
            name="arquivo"
            getValueFromEvent={(file: File | null) => file}
            rules={[
              {
                required: true,
                message: "Arquivo é obrigatório para tarefas personalizadas",
              },
            ]}
          >
            <ArquivoUpload />
          </Form.Item>
        )}

        <Form.Item
          name="time"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Time" options={times} />
        </Form.Item>

        <Form.Item
          name="integrante"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Integrante" options={groupMembersOptions} />
        </Form.Item>

        <Form.Item
          name="data"
          rules={[
            {
              required: true,
              validator: (_, value) => {
                const hasDates =
                  (Array.isArray(value) && value.length > 0) ||
                  selectedDates.length > 0;
                return hasDates
                  ? Promise.resolve()
                  : Promise.reject("Selecione pelo menos uma data.");
              },
            },
          ]}
        >
          <DateSelectorComponent
            name="Data"
            onChange={(dates) => {
              setSelectedDates(dates);
              form.setFieldValue("data", dates);
            }}
          />
        </Form.Item>

        <Form.Item className="col-span-3 flex justify-center">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-[200px] bg-verde hover:!bg-verde-500"
          >
            Criar Tarefa
          </Button>
        </Form.Item>
      </Form>

      <ModalLoginGSI
        visible={isModalOpen}
        setVisibleFalse={() => setIsModalOpen(false)}
        onFinish={(credentials: { usuario: string; senha: string }) =>
          handleLoginSuccess(
            credentials,
            pendingSubmitRef.current ?? formValues,
          )
        }
      />
    </div>
  );
}
