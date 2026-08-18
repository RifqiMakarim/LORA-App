'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface TableData {
  headers: string[];
  alignments: ('left' | 'center' | 'right')[];
  rows: string[][];
}

/**
 * Lightweight, zero-dependency Markdown Renderer for streaming AI responses.
 * Parses tables, headings, lists, blockquotes, code blocks, bold, italic, and inline code.
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTableLines: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      renderedElements.push(
        <ul key={`list-${keyPrefix}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-amber-500 text-slate-800 dark:text-slate-200">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      renderedElements.push(
        <ol key={`list-${keyPrefix}`} className="my-2 space-y-1.5 pl-4 list-decimal marker:text-amber-500 font-medium text-slate-800 dark:text-slate-200">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed font-normal">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  const flushTable = (keyPrefix: number) => {
    if (currentTableLines.length === 0) return;
    const tableData = parseMarkdownTable(currentTableLines);
    if (tableData) {
      renderedElements.push(
        <div key={`table-${keyPrefix}`} className="my-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-900/60">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
              <tr>
                {tableData.headers.map((header, hIdx) => {
                  const align = tableData.alignments[hIdx] || 'left';
                  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                  return (
                    <th key={hIdx} className={`px-3.5 py-2.5 font-bold uppercase tracking-wider ${alignClass}`}>
                      {renderInlineMarkdown(header)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-amber-500/5 dark:hover:bg-amber-400/5 transition-colors">
                  {row.map((cell, cIdx) => {
                    const align = tableData.alignments[cIdx] || 'left';
                    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                    return (
                      <td key={cIdx} className={`px-3.5 py-2.5 whitespace-nowrap leading-relaxed ${alignClass}`}>
                        {renderInlineMarkdown(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    currentTableLines = [];
  };

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Table detection: Line starts and/or ends with pipe, or contains table delimiter
    if (isTableLine(line)) {
      flushList(i);
      currentTableLines.push(line);
      i++;
      continue;
    }

    // If we have table lines buffered and encountered a non-table line, check if it's an empty line inside a table
    if (currentTableLines.length > 0) {
      if (line === '') {
        // Look ahead to see if the next non-empty line is a table line
        let nextIndex = i + 1;
        while (nextIndex < lines.length && lines[nextIndex].trim() === '') {
          nextIndex++;
        }
        if (nextIndex < lines.length && isTableLine(lines[nextIndex].trim())) {
          // Skip the empty line and continue accumulating table lines
          i = nextIndex;
          continue;
        }
      }
      flushTable(i);
    }

    // Empty line
    if (!line) {
      flushList(i);
      i++;
      continue;
    }

    // Unordered List (- or * or •)
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList(i);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      i++;
      continue;
    }

    // Ordered List (1. or 2.)
    const numberMatch = line.match(/^\d+\.\s+(.*)/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList(i);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberMatch[1]);
      i++;
      continue;
    }

    // Flush any pending list
    flushList(i);

    // Headings (###, ##, #)
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h4 key={i} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInlineMarkdown(line.replace(/^###\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ') || line.startsWith('# ')) {
      renderedElements.push(
        <h3 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-700">
          {renderInlineMarkdown(line.replace(/^#{1,2}\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      renderedElements.push(
        <blockquote key={i} className="my-2 pl-3 border-l-3 border-amber-500/70 italic text-slate-600 dark:text-slate-300 text-xs py-1">
          {renderInlineMarkdown(line.replace(/^>\s*/, ''))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
      renderedElements.push(<hr key={i} className="my-3 border-slate-200 dark:border-slate-700" />);
      i++;
      continue;
    }

    // Normal Paragraph
    renderedElements.push(
      <p key={i} className="my-1.5 leading-relaxed text-slate-800 dark:text-slate-100">
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  // Flush remaining buffers
  flushList(lines.length);
  flushTable(lines.length);

  return <div className={`markdown-body text-sm space-y-1 ${className}`}>{renderedElements}</div>;
}

/**
 * Checks if a line resembles a Markdown table row
 */
function isTableLine(line: string): boolean {
  if (!line.includes('|')) return false;
  const trimmed = line.trim();
  // Starts with | or has at least 2 |
  return trimmed.startsWith('|') || (trimmed.match(/\|/g) || []).length >= 2;
}

/**
 * Parses markdown table lines into headers, alignments, and data rows.
 */
function parseMarkdownTable(rawLines: string[]): TableData | null {
  const tableLines = rawLines.map(l => l.trim()).filter(l => l.length > 0 && l.includes('|'));
  if (tableLines.length < 2) return null;

  // Split lines into cells
  const parsedRows = tableLines.map(line => {
    let cleaned = line.trim();
    if (cleaned.startsWith('|')) cleaned = cleaned.slice(1);
    if (cleaned.endsWith('|')) cleaned = cleaned.slice(0, -1);
    return cleaned.split('|').map(c => c.trim());
  });

  // Check if row 1 is divider
  const isDividerRow = (row: string[]) => row.length > 0 && row.every(cell => /^:?-{2,}:?$/.test(cell.trim()));

  let headers: string[] = parsedRows[0];
  let alignments: ('left' | 'center' | 'right')[] = [];
  let rows: string[][] = [];

  if (parsedRows.length >= 2 && isDividerRow(parsedRows[1])) {
    alignments = parsedRows[1].map(cell => {
      const c = cell.trim();
      if (c.startsWith(':') && c.endsWith(':')) return 'center';
      if (c.endsWith(':')) return 'right';
      return 'left';
    });
    rows = parsedRows.slice(2);
  } else {
    alignments = headers.map(() => 'left');
    rows = parsedRows.slice(1);
  }

  return { headers, alignments, rows };
}

/**
 * Parses inline tokens: **bold**, *italic*, `code`
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to split by bold (**text**), inline code (`code`), or italic (*text*)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    // Bold (**...**)
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline Code (`...`)
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-xs border border-amber-500/20"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic (*...*)
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-slate-700 dark:text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}
