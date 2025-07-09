type Props = {
  value: string;
  options: string[];
  onChange: (val: string) => void;
};

export function TimeRangeSelector({ value, options, onChange }: Props) {
  return (
    <div className="w-full max-w-md mx-auto bg-[var(--background)]">
      <div className="flex border border-gray-300 rounded overflow-hidden text-sm font-medium">
        {options.map((key, index) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 py-2 text-center transition ${
              value === key
                ? "bg-blue-600 text-white"
                : "bg-transparent text-[var(--foreground)] hover:bg-gray-100"
            }`}
            style={{
              // Optional: add left/right border except for first/last
              borderLeft: index !== 0 ? "1px solid #ccc" : "none",
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
