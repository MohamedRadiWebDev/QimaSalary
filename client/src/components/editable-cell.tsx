import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: number | null | undefined;
  onChange: (value: number | null) => Promise<void>;
  isEditable?: boolean;
  className?: string;
}

export function EditableCell({
  value,
  onChange,
  isEditable = true,
  className,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const displayValue = value !== null && value !== undefined && !isNaN(value)
    ? value.toLocaleString("ar-EG")
    : "-";

  const handleStartEdit = () => {
    if (!isEditable) return;
    setEditValue(value !== null && value !== undefined ? String(value) : "");
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();
    let newValue: number | null = null;
    
    if (trimmed !== "" && trimmed !== "-") {
      const parsed = parseFloat(trimmed.replace(/,/g, ""));
      if (isNaN(parsed)) {
        setError("يجب إدخال رقم صحيح");
        return;
      }
      newValue = parsed;
    }

    if (newValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onChange(newValue);
      setIsEditing(false);
    } catch (err) {
      setError("فشل في الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditable) {
    return (
      <span className={cn("font-mono text-sm", className)} dir="ltr">
        {displayValue}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isLoading}
          className={cn(
            "h-7 w-24 px-2 text-sm font-mono",
            error && "border-destructive",
            className
          )}
          dir="ltr"
          data-testid="input-editable-cell"
        />
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className={cn(
        "font-mono text-sm px-2 py-1 rounded-md cursor-pointer",
        "hover:bg-accent transition-colors text-right w-full",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      dir="ltr"
      data-testid="button-editable-cell"
    >
      {displayValue}
    </button>
  );
}
