"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateSelectorProps {
  name: string;
  onChange?: (dates: Date[]) => void; // Agora aceita um array de datas
}

export default function DateSelectorComponent({
  name,
  onChange,
}: DateSelectorProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleChange = (date: Date | null) => {
    if (date) {
      setSelectedDates((prevDates) => {
        let updatedDates;

        if (prevDates.some((d) => d.getTime() === date.getTime())) {
          updatedDates = prevDates.filter(
            (d) => d.getTime() !== date.getTime(),
          ); // Remove se já existir
        } else {
          updatedDates = [...prevDates, date]; // Adiciona a nova data
        }

        return updatedDates;
      });
    }
  };

  useEffect(() => {
    // Notifica o pai somente quando as datas mudam. Não incluir onChange nas deps para evitar
    onChange?.(selectedDates);
  }, [selectedDates]);

  return (
    <div className="flex flex-col gap-2 w-[300px]">
      <label className="font-semibold text-gray-700">{name}</label>
      <div className="relative">
        <DatePicker
          selected={null} // Mantemos null para múltiplas seleções
          onChange={handleChange}
          inline
          className="w-full p-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-600 cursor-pointer"
        />
      </div>

      {/* Exibir datas selecionadas */}
      {selectedDates.length > 0 && (
        <div className="mt-2 p-2 border rounded-lg bg-gray-100">
          <h3 className="text-sm font-medium text-gray-700">
            Datas Selecionadas:
          </h3>
          <ul className="text-sm text-gray-600">
            {selectedDates.map((date, index) => (
              <li key={index}>{date.toLocaleDateString("pt-BR")}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
