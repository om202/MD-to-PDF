'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Font, pdf } from '@react-pdf/renderer';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

// Register emoji source using Twemoji (Twitter's open-source emoji library)
// Emojis will be embedded as images in the PDF
Font.registerEmojiSource({
    format: 'png',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
});

// Using built-in PDF fonts:
// - Helvetica (sans-serif) - also has Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique
// - Courier (monospace) - also has Courier-Bold, Courier-Oblique, Courier-BoldOblique
// - Times-Roman (serif) - also has Times-Bold, Times-Italic, Times-BoldItalic

// PDF Styles - GitHub Markdown CSS scaled for PDF (10pt base instead of 16px)
// Scale factor: 0.625 (10/16)
const PDF_SCALE = 0.625;

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10, // 16 * 0.625
        lineHeight: 1.5,
        color: '#1f2328',
        backgroundColor: '#ffffff',
    },
    // Headings
    h1: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 20, // 32 * 0.625
        marginTop: 0,
        marginBottom: 10,
        paddingBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d9e0',
        lineHeight: 1.25,
        color: '#1f2328',
    },
    h2: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 15, // 24 * 0.625
        marginTop: 15,
        marginBottom: 10,
        paddingBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d9e0',
        lineHeight: 1.25,
        color: '#1f2328',
    },
    h3: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 12.5, // 20 * 0.625
        marginTop: 15,
        marginBottom: 10,
        lineHeight: 1.25,
        color: '#1f2328',
    },
    h4: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10, // 16 * 0.625
        marginTop: 15,
        marginBottom: 10,
        lineHeight: 1.25,
        color: '#1f2328',
    },
    h5: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8.75, // 14 * 0.625
        marginTop: 15,
        marginBottom: 10,
        lineHeight: 1.25,
        color: '#1f2328',
    },
    h6: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8.5, // 13.6 * 0.625
        marginTop: 15,
        marginBottom: 10,
        lineHeight: 1.25,
        color: '#59636e',
    },
    // Paragraph
    paragraph: {
        marginBottom: 10,
        color: '#1f2328',
    },
    // Text styles
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    italic: {
        fontFamily: 'Helvetica-Oblique',
    },
    strikethrough: {
        textDecoration: 'line-through',
    },
    // Links
    link: {
        color: '#0969da',
    },
    // Blockquote
    blockquote: {
        marginVertical: 10,
        paddingLeft: 10,
        borderLeftWidth: 2.5,
        borderLeftColor: '#d1d9e0',
    },
    blockquoteText: {
        color: '#59636e',
    },
    // Lists
    list: {
        marginBottom: 10,
        paddingLeft: 0,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 2.5,
    },
    listBullet: {
        width: 15,
        color: '#1f2328',
    },
    listNumber: {
        width: 18,
        color: '#1f2328',
    },
    listContent: {
        flex: 1,
        color: '#1f2328',
    },
    // Code - 85% of base
    inlineCode: {
        fontFamily: 'Courier',
        fontSize: 8.5, // 10 * 0.85
        backgroundColor: '#f6f8fa',
        paddingHorizontal: 3,
        paddingVertical: 2,
        borderRadius: 4,
    },
    // Code block
    codeBlock: {
        fontFamily: 'Courier',
        fontSize: 8.5,
        backgroundColor: '#f6f8fa',
        color: '#1f2328',
        padding: 10,
        marginVertical: 10,
        borderRadius: 4,
    },
    codeText: {
        fontFamily: 'Courier',
        fontSize: 8.5,
        lineHeight: 1.45,
    },
    // Table
    table: {
        marginVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d9e0',
        backgroundColor: '#ffffff',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d9e0',
    },
    tableCell: {
        flex: 1,
        padding: 6,
        fontSize: 10,
        color: '#1f2328',
        borderWidth: 1,
        borderColor: '#d1d9e0',
    },
    tableHeaderCell: {
        fontFamily: 'Helvetica-Bold',
        flex: 1,
        padding: 6,
        fontSize: 10,
        color: '#1f2328',
        borderWidth: 1,
        borderColor: '#d1d9e0',
    },
    // Horizontal rule
    hr: {
        marginVertical: 15,
        borderBottomWidth: 2.5,
        borderBottomColor: '#d1d9e0',
    },
});

// Types for markdown AST nodes
interface MarkdownNode {
    type: string;
    children?: MarkdownNode[];
    value?: string;
    url?: string;
    depth?: number;
    ordered?: boolean;
    start?: number;
    lang?: string;
    checked?: boolean | null;
}

// Parse markdown to AST
const parseMarkdown = (markdown: string): MarkdownNode => {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm);

    return processor.parse(markdown) as MarkdownNode;
};

// Render inline content (text, emphasis, strong, etc.)
const renderInlineContent = (nodes: MarkdownNode[]): React.ReactNode[] => {
    return nodes.map((node, index) => {
        switch (node.type) {
            case 'text':
                return <Text key={index}>{node.value}</Text>;

            case 'strong':
                return (
                    <Text key={index} style={styles.bold}>
                        {node.children && renderInlineContent(node.children)}
                    </Text>
                );

            case 'emphasis':
                return (
                    <Text key={index} style={styles.italic}>
                        {node.children && renderInlineContent(node.children)}
                    </Text>
                );

            case 'delete':
                return (
                    <Text key={index} style={styles.strikethrough}>
                        {node.children && renderInlineContent(node.children)}
                    </Text>
                );

            case 'link':
                return (
                    <Link key={index} src={node.url || ''} style={styles.link}>
                        {node.children && renderInlineContent(node.children)}
                    </Link>
                );

            case 'inlineCode':
                return (
                    <Text key={index} style={styles.inlineCode}>
                        {node.value}
                    </Text>
                );

            default:
                if (node.value) {
                    return <Text key={index}>{node.value}</Text>;
                }
                if (node.children) {
                    return renderInlineContent(node.children);
                }
                return null;
        }
    });
};

// Render block content (paragraphs, headings, lists, etc.)
const renderBlockContent = (nodes: MarkdownNode[]): React.ReactNode[] => {
    let listCounter = 1;

    return nodes.map((node, index) => {
        switch (node.type) {
            case 'heading':
                const headingStyle = styles[`h${node.depth}` as keyof typeof styles] || styles.h3;
                return (
                    <Text key={index} style={headingStyle}>
                        {node.children && renderInlineContent(node.children)}
                    </Text>
                );

            case 'paragraph':
                return (
                    <Text key={index} style={styles.paragraph}>
                        {node.children && renderInlineContent(node.children)}
                    </Text>
                );

            case 'blockquote':
                return (
                    <View key={index} style={styles.blockquote}>
                        <Text style={styles.blockquoteText}>
                            {node.children && node.children.map((child, i) => {
                                if (child.type === 'paragraph' && child.children) {
                                    return renderInlineContent(child.children);
                                }
                                return null;
                            })}
                        </Text>
                    </View>
                );

            case 'list':
                const isOrdered = node.ordered;
                listCounter = node.start || 1;
                return (
                    <View key={index} style={styles.list}>
                        {node.children?.map((item, i) => {
                            const bullet = isOrdered ? `${listCounter++}.` : '•';
                            return (
                                <View key={i} style={styles.listItem}>
                                    <Text style={isOrdered ? styles.listNumber : styles.listBullet}>
                                        {bullet}
                                    </Text>
                                    <View style={styles.listContent}>
                                        {item.children?.map((child, j) => {
                                            if (child.type === 'paragraph' && child.children) {
                                                return (
                                                    <Text key={j}>
                                                        {renderInlineContent(child.children)}
                                                    </Text>
                                                );
                                            }
                                            if (child.type === 'list') {
                                                return (
                                                    <View key={j} style={{ marginTop: 4, paddingLeft: 16 }}>
                                                        {renderBlockContent([child])}
                                                    </View>
                                                );
                                            }
                                            return null;
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                );

            case 'code':
                return (
                    <View key={index} style={styles.codeBlock}>
                        <Text style={styles.codeText}>
                            {node.value}
                        </Text>
                    </View>
                );

            case 'table':
                const rows = node.children || [];
                return (
                    <View key={index} style={styles.table}>
                        {rows.map((row, rowIndex) => {
                            const isHeader = row.type === 'tableRow' && rowIndex === 0;
                            return (
                                <View
                                    key={rowIndex}
                                    style={isHeader ? styles.tableHeaderRow : styles.tableRow}
                                >
                                    {row.children?.map((cell, cellIndex) => (
                                        <Text
                                            key={cellIndex}
                                            style={isHeader ? styles.tableHeaderCell : styles.tableCell}
                                        >
                                            {cell.children && renderInlineContent(cell.children)}
                                        </Text>
                                    ))}
                                </View>
                            );
                        })}
                    </View>
                );

            case 'thematicBreak':
                return <View key={index} style={styles.hr} />;

            default:
                return null;
        }
    });
};

// Main PDF Document component
interface PDFDocumentProps {
    markdown: string;
    pageSize?: [number, number];
    margin?: number;
}

const MarkdownPDFDocument: React.FC<PDFDocumentProps> = ({
    markdown,
    pageSize = [595.28, 841.89], // A4 in points
    margin = 40
}) => {
    const ast = parseMarkdown(markdown);
    const content = ast.children ? renderBlockContent(ast.children) : null;

    return (
        <Document>
            <Page
                size={pageSize as [number, number]}
                style={{ ...styles.page, padding: margin }}
            >
                {content}
            </Page>
        </Document>
    );
};

// Generate PDF blob
export const generatePDFBlob = async (
    markdown: string,
    pageSize: [number, number] = [595.28, 841.89],
    margin: number = 40
): Promise<Blob> => {
    const doc = <MarkdownPDFDocument markdown={markdown} pageSize={pageSize} margin={margin} />;
    const blob = await pdf(doc).toBlob();
    return blob;
};

export default MarkdownPDFDocument;
