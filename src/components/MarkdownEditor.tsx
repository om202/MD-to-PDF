'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-4">
                <div className="bg-white border rounded p-4 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">MD to PDF</h1>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Page Size:</label>
                            <select
                                className="border rounded px-3 py-1.5"
                                value={pageSize}
                                onChange={(e) => setPageSize(e.target.value)}
                            >
                                <option value="a4">A4</option>
                                <option value="letter">Letter</option>
                                <option value="legal">Legal</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Margin (mm):</label>
                            <input
                                type="number"
                                className="border rounded px-3 py-1.5 w-20"
                                min="0"
                                max="50"
                                value={margin}
                                onChange={(e) => setMargin(Number(e.target.value))}
                            />
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isExporting ? 'Exporting...' : 'Export PDF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor and Preview */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">
                {/* Editor */}
                <div className="bg-white border rounded overflow-hidden">
                    <div className="bg-gray-100 border-b px-4 py-2 font-medium">
                        Editor
                    </div>
                    <textarea
                        className="w-full h-[calc(100vh-200px)] p-4 font-mono text-sm resize-none focus:outline-none"
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                    />
                </div>

                {/* Preview */}
                <div className="bg-white border rounded overflow-hidden">
                    <div className="bg-gray-100 border-b px-4 py-2 font-medium">
                        Preview
                    </div>
                    <div className="h-[calc(100vh-200px)] overflow-auto">
                        <div id="preview" className="p-4 prose prose-sm max-w-none">
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
