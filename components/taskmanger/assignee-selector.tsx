import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface AssigneeSelectorProps {
  options: Option[]; // data passed from DB
  value: Option[];
  onChange: (selected: Option[]) => void;
}

export function AssigneeSelector({ options, value, onChange }: AssigneeSelectorProps) {
  const [query, setQuery] = useState("");

  // Filter options by search query and remove already-selected ones.
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(query.toLowerCase()) &&
      !value.find((selected) => selected.value === option.value)
  );

  const addAssignee = (option: Option) => {
    onChange([...value, option]);
    setQuery("");
  };

  const removeAssignee = (optionValue: string) => {
    onChange(value.filter((option) => option.value !== optionValue));
  };

  return (
    <div className="relative">
      {/* Display selected users as tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((option) => (
          <div
            key={option.value}
            className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded px-2 py-1"
          >
            <span className="text-sm">{option.label}</span>
            <button onClick={() => removeAssignee(option.value)}>
              <X size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        ))}
      </div>

      {/* Search input */}
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search assignees..."
      />

      {/* Dropdown list */}
      {query && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white dark:bg-background border border-gray-300 dark:border-gray-600 rounded mt-1">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => addAssignee(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
