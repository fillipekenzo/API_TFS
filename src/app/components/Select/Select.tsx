"use client";
import { useState } from "react";
import Style from "./style.module.scss";
import { FaChevronDown } from "react-icons/fa";

interface SelectProps {
  name: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}

export default function SelectComponent(props: SelectProps) {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    if (props.onChange) {
      props.onChange(value);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-[300px]">
      {" "}
      {/* Definição do width padrão */}
      <label className="font-semibold text-gray-700">{props?.name}</label>
      <div className="relative">
        <select
          className="w-full p-2 border rounded-lg shadow-[4px_4px_6px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-gray-600 appearance-none cursor-pointer"
          value={selectedValue}
          onChange={handleChange}
        >
          <option value="" disabled>
            Selecione
          </option>
          {props?.options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="w-full h-20 text-gray-700 bg-white hover:bg-secondary hover:text-white transition-all"
            >
              {" "}
              {/* Cor no hover */}
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <FaChevronDown></FaChevronDown>
        </div>
      </div>
    </div>
  );
}
