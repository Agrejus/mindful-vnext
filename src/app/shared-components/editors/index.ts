import { IPage, PageType } from '../../data-access/entities/Page';
import { TextEditorContainer } from './text-editor/TextEditor';
import { AppsEditorContainer } from './apps-editor/AppsEditor';
import { DocumentContainer } from './document-editor/DocumentEditor';
import { KanbanEditorContainer } from './kanban-editor/KanbanEditor';
import { NotepadContainer } from './notepad-editor/NotepadEditor';
import { LinksContainer } from './links-editor/LinksEditor';
import { RichTextEditorContainer } from './rich-text-editor/RichTextEditor';
import { MarkdownContainer } from './markdown-editor/MarkdownEditor';

export type Action = () => void;

export interface IDomActionable {
    canIgnore?: (e: MouseEvent) => boolean;
    action: Action;
}

export interface EditorProps {
    content: any;
    onChange: (content: any, sum?: number) => void;
    registerDomClickActions?: (actions: IDomActionable[]) => void;
}

export interface IEditor {
    render: (props: EditorProps) => React.ReactNode;
    getDefaultContent: () => any;
    parse: (page: IPage) => any;
    stringify: (page: IPage) => string;
    stringifySearchContent: (content: any) => string;
    icon: string;
    type: PageType;
    displayName: string;

    // migration - canMigrate, migrate
    // render tile?
}

export const editors: IEditor[] = [
    new DocumentContainer(),
    new LinksContainer(),
    new MarkdownContainer(),
    new NotepadContainer(),
    new RichTextEditorContainer(),
    new TextEditorContainer(),
    // new VisualStudioEnvironmentEditor(),
    new KanbanEditorContainer(),
    // new TaskEditorContainer(),
    new AppsEditorContainer()
];

export const render = (type: PageType, props: EditorProps): React.ReactNode | null => {
    try {
        const editor = editors.find(w => w.type === type);

        if (!editor) {
            return null;
        }

        return editor.render(props);
    } catch (ex) {
        alert(ex)
        return null;
    }
}

export const getDisplayName = (type: PageType) => {
    const editor = editors.find(w => w.type === type);

    if (!editor) {
        return "";
    }

    return editor.displayName;
}

export const getDefaultContent = (type: PageType) => {
    const editor = editors.find(w => w.type === type);

    if (!editor) {
        return null;
    }

    return editor.getDefaultContent();
}

export const getIconClass = (type: PageType) => {
    const editor = editors.find(w => w.type === type);

    if (!editor) {
        return undefined;
    }

    return editor.icon;
}

export const stringifySearchContent = (pageType: PageType, content: any) => {
    const editor = editors.find(w => w.type === pageType);

    if (!editor) {
        return null;
    }

    return editor.stringifySearchContent(content);
}

export const stringify = (page: IPage) => {
    const editor = editors.find(w => w.type === page.pageType);

    if (!editor) {
        return '';
    }

    return editor.stringify(page);
}

export const parse = (page: IPage) => {
    const editor = editors.find(w => w.type === page.pageType);

    if (!editor) {
        return null;
    }

    return editor.parse(page);
}