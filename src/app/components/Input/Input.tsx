"use client";
import { useEffect } from "react";
import { Form } from "antd";

interface InputProps {
  name: string;
  placeholder?: string;
  type?: HTMLInputElement['type'];
  form: any;
  nameForm: any;
}

export default function InputComponent({ name, placeholder, type = 'text', form ,nameForm}: InputProps) {
  const { getFieldValue, setFieldsValue } = form;

  useEffect(() => {
    setFieldsValue({ [nameForm]: getFieldValue(nameForm) });
  }, [nameForm, getFieldValue, setFieldsValue]);

  return (
    <div className="flex flex-col gap-1 w-[300px]">
      <label className="font-semibold text-gray-700">{name}</label>
      <div className="relative">
        <input
          type={type}
          className="w-full p-2 border rounded-lg shadow-[4px_4px_6px_rgba(0,0,0,0.1)]
                     focus:outline-none focus:ring-2 focus:ring-gray-600"
          value={getFieldValue(nameForm) || ""}
          onChange={(e) => setFieldsValue({ [nameForm]: e.target.value })}
          placeholder={placeholder || ""}
        />
      </div>
    </div>
  );
}
