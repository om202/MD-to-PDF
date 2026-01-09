'use client';

import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileDown, FileText, Eye, Settings, Github, X } from 'lucide-react';
import { generatePDFBlob } from './PDFGenerator';

// Official GitHub Markdown CSS
import 'github-markdown-css/github-markdown-light.css';

const defaultMarkdown = `# Welcome to MD to PDF Converter

> A powerful, free online tool for converting Markdown to professional PDF documents with live preview.

## 🚀 Key Features

- **Live Preview** - See your formatted document in real-time
- **High-Quality Export** - Professional-grade PDFs
- **Multiple Page Sizes** - A4, Letter, Legal, and more
- **Configurable Margins** - Choose from preset margin options
- **Syntax Highlighting** - Beautiful code blocks
- **Emoji Support** - Full emoji rendering 🎉
- **No Sign-up Required** - Start using immediately

### Getting Started

1. Edit this text in the left panel
2. See your changes in real-time on the right
3. Click **Export PDF** to preview
4. Download your professional PDF

New to Markdown? Check out the [Official Markdown Guide](https://www.markdownguide.org/).

---

# Markdown Elements Reference

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Text Formatting

**Bold text** and *italic text* and ***bold italic text***.

~~Strikethrough text~~ for deleted content.

This is a paragraph with regular text that wraps naturally.

---

## Links

- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub](https://github.com)

---

## Lists

### Unordered List
- First item
- Second item
  - Nested item A
  - Nested item B
    - Deep nested
- Third item

### Ordered List
1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

### Task List
- [x] Completed task
- [ ] Incomplete task

---

## Blockquotes

> This is a blockquote. It can contain multiple paragraphs.
>
> Second paragraph in the blockquote.

---

## Code

### Inline Code
Use \`const x = 10;\` for inline code.

### Code Blocks

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

\`\`\`python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
\`\`\`

---

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Live Preview | ✅ Ready | High |
| PDF Export | ✅ Ready | High |
| Custom Themes | 🚧 Coming | Medium |

| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |

---

## Emojis 🎉

Supported emojis: 🚀 📝 💡 ✅ ❌ 🎨 🔧 📊 🔥 ⭐

---

## Horizontal Rules

Three dashes: ---

Three asterisks: ***

---

**Ready to create your own document? Start editing now!** ✨
`;

// Page size dimensions - mm for display, points for PDF (72 points = 1 inch)
// Conversion: mm * 2.83465 = points
const PAGE_SIZES: Record<string, { label: string; size: [number, number]; ptsSize: [number, number] }> = {
    a3: { label: 'A3', size: [297, 420], ptsSize: [841.89, 1190.55] },
    a4: { label: 'A4', size: [210, 297], ptsSize: [595.28, 841.89] },
    a5: { label: 'A5', size: [148, 210], ptsSize: [419.53, 595.28] },
    b5: { label: 'B5', size: [176, 250], ptsSize: [498.9, 708.66] },
    letter: { label: 'Letter', size: [216, 279], ptsSize: [612, 792] },
    legal: { label: 'Legal', size: [216, 356], ptsSize: [612, 1008] },
    tabloid: { label: 'Tabloid', size: [279, 432], ptsSize: [792, 1224] },
    executive: { label: 'Executive', size: [184, 267], ptsSize: [521.86, 756.85] },
};

// Margin presets in mm
const MARGIN_PRESETS: Record<string, { label: string; value: number }> = {
    none: { label: 'None', value: 0 },
    narrow: { label: 'Narrow', value: 10 },
    normal: { label: 'Normal', value: 20 },
    wide: { label: 'Wide', value: 30 },
};

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState(defaultMarkdown);
    const [pageSize, setPageSize] = useState('a4');
    const [marginPreset, setMarginPreset] = useState('normal');
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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

    const generatePDF = async () => {
        setIsExporting(true);
        try {
            // Get page size in points for react-pdf
            const selectedPtsSize = PAGE_SIZES[pageSize]?.ptsSize || PAGE_SIZES.a4.ptsSize;
            // Convert margin from mm to points (1mm = 2.83465 points)
            const marginValue = (MARGIN_PRESETS[marginPreset]?.value ?? 20) * 2.83465;

            // Generate PDF using @react-pdf/renderer
            const blob = await generatePDFBlob(markdown, selectedPtsSize, marginValue);
            const url = URL.createObjectURL(blob);

            setPdfBlob(blob);
            setPdfUrl(url);
            setShowPreview(true);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownload = () => {
        if (pdfBlob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'md_to_pdf.pdf';
            link.click();
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
            setPdfBlob(null);
        }
    };

    const handleExport = () => generatePDF();

    return (
        <div className="h-screen flex flex-col bg-[#f8f9fa]">
            {/* Header */}
            <header className="bg-white border-b border-[#e5e7eb] shrink-0">
                <div className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo_md_pdf.png"
                                alt="MD to PDF Logo"
                                className="w-9 h-9 object-contain"
                            />
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
                                    {Object.entries(PAGE_SIZES).map(([key, { label }]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fa] rounded-lg border border-[#e5e7eb]">
                                <span className="text-sm text-[#6b7280]">Margin</span>
                                <select
                                    className="bg-transparent text-sm text-[#1a1a1a] font-medium focus:outline-none cursor-pointer"
                                    value={marginPreset}
                                    onChange={(e) => setMarginPreset(e.target.value)}
                                >
                                    {Object.entries(MARGIN_PRESETS).map(([key, { label }]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>



                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-black text-white px-4 py-1.5 rounded-lg font-medium text-sm disabled:bg-[#9ca3af] disabled:cursor-not-allowed cursor-pointer"
                            >
                                <FileDown className="w-4 h-4" />
                                {isExporting ? 'Exporting...' : 'Export PDF'}
                            </button>

                            {/* GitHub Attribution */}
                            <a
                                href="https://github.com/om202"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors ml-2 pl-3 border-l border-[#e5e7eb]"
                            >
                                <Github className="w-4 h-4" />
                                <span>by <span className="font-medium">Omprakash Sah</span></span>
                            </a>
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
                        <div id="preview" className="markdown-body p-6 bg-white">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');

                                        // For code blocks (with language)
                                        if (match) {
                                            return (
                                                <pre>
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            );
                                        }

                                        // For inline code
                                        return (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showPreview && pdfUrl && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                            <h2 className="text-lg font-semibold text-[#1a1a1a]">PDF Preview</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-black text-white px-4 py-2 rounded-lg font-medium text-sm cursor-pointer"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={handleClosePreview}
                                    className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5 text-[#6b7280]" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Preview */}
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
