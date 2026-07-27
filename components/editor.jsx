"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolbarActions = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "formatBlock", value: "blockquote", label: "Quote", icon: Quote },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "undo", label: "Undo", icon: Undo2 },
  { command: "redo", label: "Redo", icon: Redo2 },
];

export const Editor = ({
  onChange,
  value = "",
  disabled = false,
  placeholder = "Write your content...",
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (
      editorRef.current &&
      document.activeElement !== editorRef.current &&
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command, commandValue = null) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  const addLink = () => {
    const url = window.prompt("Enter a link URL");
    if (url) runCommand("createLink", url);
  };

  return (
    <div className={cn("overflow-hidden rounded-md border bg-white", disabled && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-slate-50 p-2">
        <select
          aria-label="Text style"
          disabled={disabled}
          className="h-8 rounded border bg-white px-2 text-sm"
          defaultValue="p"
          onChange={(event) => runCommand("formatBlock", event.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
        {toolbarActions.map(({ command, value: commandValue, label, icon: Icon }) => (
          <button
            key={`${command}-${commandValue || ""}`}
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command, commandValue)}
            className="flex size-8 items-center justify-center rounded hover:bg-slate-200 disabled:cursor-not-allowed"
          >
            <Icon className="size-4" />
          </button>
        ))}
        <button
          type="button"
          title="Add link"
          aria-label="Add link"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
          className="flex size-8 items-center justify-center rounded hover:bg-slate-200 disabled:cursor-not-allowed"
        >
          <Link className="size-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-40 px-3 py-2 text-sm outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_a]:text-sky-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:text-lg [&_h4]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
      />
    </div>
  );
};
