'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEnvironmentsStore } from '@/store/use-environments-store';

interface VariableAutocompleteTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function VariableAutocompleteTextarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 10,
}: VariableAutocompleteTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { environments } = useEnvironmentsStore();
  const activeEnvironment = environments.find((env) => env.isActive);
  const variables = activeEnvironment?.variables.filter((v) => v.enabled) || [];

  // Calculate cursor position for suggestions popup
  const calculateSuggestionPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length;

    // Approximate character width and line height
    const charWidth = 8;
    const lineHeight = 24;

    setSuggestionPosition({
      top: currentLine * lineHeight,
      left: Math.min(currentColumn * charWidth, 300),
    });
  };

  // Detect {{ pattern and show suggestions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      calculateSuggestionPosition();
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
        } else {
          calculateSuggestionPosition();
        }
      } else {
        setShowSuggestions(false);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
      if (textareaRef.current) {
        const newCursorPos = beforeBrackets.length + variableName.length + 4;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
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
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-80 rounded-md border bg-popover p-1 shadow-md"
          style={{
            top: suggestionPosition.top + 30,
            left: suggestionPosition.left,
          }}
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
