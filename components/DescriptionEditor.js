'use client';

import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Type } from 'lucide-react';

import { toEditorHtml } from '../app/lib/productDescription';

const TOOLS = [
  { id: 'bold', label: 'Bold', icon: Bold, command: 'bold' },
  { id: 'italic', label: 'Italic', icon: Italic, command: 'italic' },
  { id: 'underline', label: 'Underline', icon: Underline, command: 'underline' },
  { id: 'ul', label: 'List', icon: List, command: 'insertUnorderedList' },
  { id: 'ol', label: 'Numbers', icon: ListOrdered, command: 'insertOrderedList' },
  { id: 'h2', label: 'Heading', command: 'formatBlock', arg: 'h2' },
  { id: 'small', label: 'A-', command: 'fontSize', arg: '2' },
  { id: 'normal', label: 'A', command: 'fontSize', arg: '3' },
  { id: 'large', label: 'A+', command: 'fontSize', arg: '5' },
];

export default function DescriptionEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (document.activeElement === editor) return;
    const next = toEditorHtml(value);
    if (editor.innerHTML !== next) editor.innerHTML = next;
  }, [value]);

  const run = (command, arg) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg ?? null);
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div>
      <label className="dashboardproductmodalsectionlabel" style={styles.label}>
        Product Description *
      </label>
      <p style={styles.help}>
        Required. Tell buyers what this product is, who it is for, fabric or ingredients, and how to use it. Use bold, lists, and font size so it is easy to read.
      </p>
      <div style={styles.toolbar}>
        {TOOLS.map((tool) => {
          const Icon = tool.icon || Type;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => run(tool.command, tool.arg)}
              style={styles.tool}
              title={tool.label}
              aria-label={tool.label}
            >
              {tool.icon ? <Icon size={14} /> : tool.label}
            </button>
          );
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        style={styles.editor}
        data-placeholder="Write the full product details here…"
      />
    </div>
  );
}

const styles = {
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 6,
    color: '#1a4845',
  },
  help: {
    fontSize: 13,
    color: '#5c6b66',
    margin: '0 0 8px',
    lineHeight: 1.4,
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tool: {
    minWidth: 36,
    minHeight: 36,
    border: '1px solid rgba(26, 72, 69, 0.16)',
    background: '#fff',
    color: '#1a4845',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    fontSize: 13,
    fontWeight: 600,
  },
  editor: {
    minHeight: 180,
    border: '1px solid #1a4845',
    borderRadius: 8,
    padding: 12,
    background: '#fff',
    color: '#14241f',
    lineHeight: 1.5,
    fontSize: 16,
    outline: 'none',
  },
};
