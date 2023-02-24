import './TextEditor.scss';
import React, { forwardRef, PropsWithChildren, useImperativeHandle } from 'react';
import { EditorProps, IEditor, IEditorApi, ToolbarEditorProps } from '..';
import { IPage, PageType } from '../../../data-access/entities/Page';
import { ContentToolbarButtonGroup } from '../../toolbar/content-toolbar-button-group/ContentToolbarButtonGroup';
import { ContentToolbarTallButton } from '../../toolbar/content-toolbar-buttons/ContentToolbarTallButton';
import { ContentToolbarGroup } from '../../toolbar/content-toolbar-group/ContentToolbarGroup';
import { ContentToolbarLabel } from '../../toolbar/content-toolbar-label/ContentToolbarLabel';
import { ILinksEditorApi } from '../links-editor/LinksEditor';

const TextEditor = forwardRef<ILinksEditorApi, PropsWithChildren<EditorProps>>((props, ref) => {

    const { content, onChange } = props;

    useImperativeHandle(ref, () => ({
        stop: async () => {
          
        }
    }), [])

    return <div className="text-editor">
        <textarea value={content} onChange={e => onChange(e.target.value)} />
    </div>
})

const TextEditorHeader: React.FC<EditorProps> = (props) => {

    return <>
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarTallButton icon={<i className='bi bi-x-lg text-delete'></i>} label='Delete Page' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Text Editor Actions' />
        </ContentToolbarGroup>
    </>
}

export const textEditor: IEditor<EditorProps, IEditorApi> = {
    stringifySearchContent: (content: string) => content,
    getComponent: () => TextEditor,
    renderToolbar: (props: ToolbarEditorProps) => <TextEditorHeader {...props} />,
    getDefaultContent: () => "",
    parse: (page: IPage) => page.content,
    stringify: (page: IPage) => page.content,
    type: PageType.PlainText,
    icon: "bi bi-file-text",
    displayName : "Plain Text"
}