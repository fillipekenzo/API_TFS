"use client";
import { useState } from "react";
import { FaPaperclip } from "react-icons/fa";

interface InputFileProps {
  name: string;
  accept: string;
  value?: File;
  onChange?: (file: File | null) => void;
}

export default function InputFileComponent({ name, accept, value, onChange }: InputFileProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange?.(file);
    }
  };

  const handleReset = () => {
    setFileName(null);
    onChange?.(null);
  };

  return (
    <div className="flex flex-col gap-2 w-[300px]">
      <label className="font-semibold text-gray-700">{name}</label>
      <div className="relative flex items-center border rounded-lg shadow-md p-2 bg-white cursor-pointer">
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
        />
        <FaPaperclip className="text-gray-500 mr-2" />
        <span className="text-sm text-gray-700">
          {fileName || "Escolha um arquivo"}
        </span>
      </div>
      {fileName && (
        <button
          onClick={handleReset}
          className="text-sm text-red-500 underline cursor-pointer"
        >
          Remover arquivo 
        </button>
      )}
    </div>
  );
}
