"use client";

type Props = {
  value: string;
  options: string[];
  onChange: (val: string) => void;
};

export function TimeRangeSelector({ value, options, onChange }: Props) {
  return (
    <div className="mb-4 mt-4">
      {options.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1 mr-2 rounded ${
            value === key ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
