'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEnvironmentsStore } from '@/store/use-environments-store';

interface VariableAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function VariableAutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
}: VariableAutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { environments } = useEnvironmentsStore();
  const activeEnvironment = environments.find((env) => env.isActive);
  const variables = activeEnvironment?.variables.filter((v) => v.enabled) || [];

  // Detect {{ pattern and show suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check if we just typed {{
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastTwoBrackets = textBeforeCursor.slice(-2);
    
    if (lastTwoBrackets === '{{' && variables.length > 0) {
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else if (showSuggestions) {
      // Check if we're still inside {{...}}
      const lastOpenBracket = textBeforeCursor.lastIndexOf('{{');
      const lastCloseBracket = textBeforeCursor.lastIndexOf('}}');
      
      if (lastOpenBracket > lastCloseBracket) {
        // Still typing variable name
        const searchTerm = textBeforeCursor.substring(lastOpenBracket + 2).toLowerCase();
        const filtered = variables.filter((v) =>
          v.key.toLowerCase().includes(searchTerm)
        );
        
        if (filtered.length === 0) {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastOpenBracket = textBeforeCursor.lastIndexOf('{{');
    const searchTerm = textBeforeCursor.substring(lastOpenBracket + 2).toLowerCase();
    const filtered = variables.filter((v) =>
      v.key.toLowerCase().includes(searchTerm)
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      insertVariable(filtered[selectedIndex].key);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Insert selected variable
  const insertVariable = (variableName: string) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    const lastOpenBracket = textBeforeCursor.lastIndexOf('{{');
    const beforeBrackets = value.substring(0, lastOpenBracket);
    
    const newValue = `${beforeBrackets}{{${variableName}}}${textAfterCursor}`;
    onChange(newValue);
    
    setShowSuggestions(false);
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeBrackets.length + variableName.length + 4; // 4 for {{}}
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get filtered suggestions
  const getFilteredSuggestions = () => {
    if (!showSuggestions) return [];
    
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastOpenBracket = textBeforeCursor.lastIndexOf('{{');
    const searchTerm = textBeforeCursor.substring(lastOpenBracket + 2).toLowerCase();
    
    return variables.filter((v) =>
      v.key.toLowerCase().includes(searchTerm)
    );
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
        >
          <div className="max-h-60 overflow-y-auto">
            {filteredSuggestions.map((variable, index) => (
              <button
                key={variable.id}
                type="button"
                onClick={() => insertVariable(variable.key)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm rounded-sm hover:bg-accent transition-colors',
                  index === selectedIndex && 'bg-accent'
                )}
              >
                <div className="font-medium">{variable.key}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {variable.value}
                </div>
              </button>
            ))}
          </div>
          <div className="border-t mt-1 pt-1 px-3 py-1 text-xs text-muted-foreground">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      )}
    </div>
  );
}
