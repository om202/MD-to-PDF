'use client';

import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileDown, FileText, Eye, Settings } from 'lucide-react';

const defaultMarkdown = `# Markdown to PDF Converter

## Features
- Live preview
- Export to PDF
- Multiple page sizes
- Configurable margins

## Example Content

**Bold text** and *italic text*

### Lists
- Item 1
- Item 2
- Item 3

### Code
\`\`\`javascript
console.log('Hello World');
\`\`\`

Start editing!`;

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState(defaultMarkdown);
    const [pageSize, setPageSize] = useState('a4');
    const [margin, setMargin] = useState(15);
    const [isExporting, setIsExporting] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50); // percentage
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMouseDown = useCallback(() => {
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;

        // Clamp between 20% and 80%
        setLeftWidth(Math.min(80, Math.max(20, newWidth)));
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    // Attach global mouse events
    useState(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    });

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('preview');

            if (!element) {
                alert('Preview element not found');
                return;
            }

            const sizes: Record<string, [number, number]> = {
                a4: [210, 297],
                letter: [216, 279],
                legal: [216, 356],
            };

            await html2pdf()
                .set({
                    margin: margin,
                    filename: 'document.pdf',
                    html2canvas: { scale: 2 },
                    jsPDF: {
                        unit: 'mm',
                        format: sizes[pageSize],
                        orientation: 'portrait' as const
                    },
                })
                .from(element)
                .save();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#f8f9fa]">
            {/* Header */}
            <header className="bg-white border-b border-[#e5e7eb] shrink-0">
                <div className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#2563eb] rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-lg font-semibold text-[#1a1a1a]">MD to PDF</h1>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fa] rounded-lg border border-[#e5e7eb]">
                                <Settings className="w-4 h-4 text-[#6b7280]" />
                                <select
                                    className="bg-transparent text-sm text-[#1a1a1a] font-medium focus:outline-none cursor-pointer"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(e.target.value)}
                                >
                                    <option value="a4">A4</option>
                                    <option value="letter">Letter</option>
                                    <option value="legal">Legal</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fa] rounded-lg border border-[#e5e7eb]">
                                <span className="text-sm text-[#6b7280]">Margin</span>
                                <input
                                    type="number"
                                    className="w-12 bg-transparent text-sm text-[#1a1a1a] font-medium focus:outline-none text-center"
                                    min="0"
                                    max="50"
                                    value={margin}
                                    onChange={(e) => setMargin(Number(e.target.value))}
                                />
                                <span className="text-sm text-[#6b7280]">mm</span>
                            </div>

                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-lg font-medium text-sm disabled:bg-[#9ca3af] disabled:cursor-not-allowed"
                            >
                                <FileDown className="w-4 h-4" />
                                {isExporting ? 'Exporting...' : 'Export PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Resizable Panels */}
            <div ref={containerRef} className="flex-1 flex min-h-0">
                {/* Editor Panel */}
                <div
                    className="flex flex-col bg-white border-r border-[#e5e7eb]"
                    style={{ width: `${leftWidth}%` }}
                >
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#e5e7eb] bg-[#fafafa] shrink-0">
                        <FileText className="w-4 h-4 text-[#6b7280]" />
                        <span className="text-sm font-medium text-[#1a1a1a]">Editor</span>
                    </div>
                    <textarea
                        className="flex-1 w-full p-4 font-mono text-sm text-[#1a1a1a] bg-white resize-none focus:outline-none leading-relaxed"
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        placeholder="Start typing your markdown..."
                    />
                </div>

                {/* Resize Handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="w-1 bg-[#e5e7eb] hover:bg-[#2563eb] cursor-col-resize shrink-0 transition-colors"
                />

                {/* Preview Panel */}
                <div
                    className="flex flex-col bg-white"
                    style={{ width: `${100 - leftWidth}%` }}
                >
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#e5e7eb] bg-[#fafafa] shrink-0">
                        <Eye className="w-4 h-4 text-[#6b7280]" />
                        <span className="text-sm font-medium text-[#1a1a1a]">Preview</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <div id="preview" className="p-6 prose prose-sm max-w-none prose-headings:text-[#1a1a1a] prose-p:text-[#374151] prose-li:text-[#374151] prose-code:bg-[#f1f3f5] prose-code:text-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#f8f9fa] prose-pre:border prose-pre:border-[#e5e7eb]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
