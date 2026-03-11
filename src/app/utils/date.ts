import moment from "moment";

export function getDiffMinutes(date: Date, date2: Date) {
  const diff = (date2.getTime() - date.getTime()) / (1000 * 60);
  return Math.round(diff);
}

export function fixDate(date: string) {
  var dataHora = date?.split(" ");

  var daux = moment(dataHora[0], "DD/MM/YYYY", true).format();

  var dauxData = daux.split("T");

  var dataHoraFormatada = dauxData[0] + "T" + dataHora[1];

  return dataHoraFormatada;
}

export function dataFimMaiorQueDataInicio(dataInicio: any, dataFim: any) {
  const [dataInicioDatePart, dataInicioTimePart] = dataInicio.split(" ");
  const [diaInicio, mesInicio, anoInicio] = dataInicioDatePart
    .split("/")
    .map(Number);
  const [horaInicio = 0, minutoInicio = 0, segundoInicio = 0] =
    dataInicioTimePart ? dataInicioTimePart.split(":").map(Number) : [];

  // Extrair e mapear componentes de data e hora para dataFim
  const [dataFimDatePart, dataFimTimePart] = dataFim.split(" ");
  const [diaFim, mesFim, anoFim] = dataFimDatePart.split("/").map(Number);
  const [horaFim = 0, minutoFim = 0, segundoFim = 0] = dataFimTimePart
    ? dataFimTimePart.split(":").map(Number)
    : [];

  // Criar objetos Date para dataInicio e dataFim
  const dataInicioDate = new Date(
    anoInicio,
    mesInicio - 1,
    diaInicio,
    horaInicio,
    minutoInicio,
    segundoInicio
  );
  const dataFimDate = new Date(
    anoFim,
    mesFim - 1,
    diaFim,
    horaFim,
    minutoFim,
    segundoFim
  );

  // Retornar a comparação
  return dataFimDate >= dataInicioDate;
}
