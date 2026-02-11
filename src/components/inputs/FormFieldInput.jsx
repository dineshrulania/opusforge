import React from 'react';

const FormFieldInput = ({ fieldName, value, onChange, formatFieldName }) => {
  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-semibold tracking-wide text-gray-800">
        {formatFieldName(fieldName)}
      </label>
      <textarea
        type="text"
        value={value || ""}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className="w-full max-w-md px-4 py-1 text-gray-800 placeholder-gray-400 transition-all duration-300 ease-out bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 hover:shadow-md"
        placeholder={`Enter ${formatFieldName(fieldName).toLowerCase()}...`}
      />
    </div>
  );
};

export default FormFieldInput;