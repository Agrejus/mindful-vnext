import React from 'react';
import { IPage, PageType } from '../../data-access/entities/Page';
import { textEditor } from './text-editor/TextEditor';
import { AppsEditorContainer } from './apps-editor/AppsEditor';
import { DocumentContainer } from './document-editor/DocumentEditor';
import { kanbanEditor } from './kanban-editor/KanbanEditor';
import { notepadEditor } from './notepad-editor/NotepadEditor';
import { linksEditor } from './links-editor/LinksEditor';
import { RichTextEditorContainer } from './rich-text-editor/RichTextEditor';
import { markdownEditor } from './markdown-editor/MarkdownEditor';
import { joditRichTextEditor } from './jodit-rich-text-editor/JoditRichTextEditor';
import { PropsWithChildren } from 'react';

export type Action = () => void;

export interface IDomActionable {
    canIgnore?: (e: MouseEvent) => boolean;
    action: Action;
}

export interface EditorProps extends EditorPropsBase {
    registerDomClickActions?: (actions: IDomActionable[]) => void;
}

interface EditorPropsBase {
    content: any;
    onChange: (content: any, sum?: number) => void;
}

export interface ToolbarEditorProps<TEditorApi extends IEditorApi> extends EditorPropsBase {
    editorApi: TEditorApi;
}

export interface IEditorApi {

}

export interface IEditor<TProps extends EditorProps, TEditorApi extends IEditorApi> {
    getComponent(): React.ForwardRefExoticComponent<TProps & { children?: React.ReactNode; } & React.RefAttributes<TEditorApi>>;
    renderToolbar: (props: ToolbarEditorProps<TEditorApi>) => React.ReactNode;
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

export const editors: IEditor<EditorProps, any>[] = [
    linksEditor,
    textEditor,
    markdownEditor,
    notepadEditor,
    joditRichTextEditor,
    // new VisualStudioEnvironmentEditor(),
    kanbanEditor,
    // new TaskEditorContainer(),
    // new AppsEditorContainer()
];

export const render = (type: PageType, props: EditorProps, ref: React.ForwardedRef<IEditorApi>)=> {
    try {
        const editor = editors.find(w => w.type === type);

        if (!editor) {
            return null;
        }
        return editor.getComponent();

        //return <Component {...props} ref={ref}/>;
    } catch (ex) {
        alert(ex)
        return null;
    }
}

export const renderToolbar = (type: PageType, props: ToolbarEditorProps<IEditorApi>): React.ReactNode | null => {
    try {

        const editor = editors.find(w => w.type === type);

        if (!editor) {
            return null;
        }

        return editor.renderToolbar(props);
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