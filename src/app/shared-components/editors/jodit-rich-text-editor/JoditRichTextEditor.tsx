import React, { useState, useRef, useMemo } from 'react';
import JoditEditor from "jodit-pro-react";
import { EditorProps, IEditor } from '..';
import { IPage, PageType } from '../../../data-access/entities/Page';
import { debounce, throttle } from 'radash';
import './JoditRichTextEditor.scss';

// move to external component so we can click away and get updates
export const queueContentChange = debounce({ delay: 600 }, throttle({ interval: 600 }, async (content: string, onChange: (content: any) => void) => {
    onChange(content);
}))

export interface IJoditRichTextEditorProps extends EditorProps {
    showToolbar: boolean
}

const JoditRichTextEditor: React.FunctionComponent<IJoditRichTextEditorProps> = (props) => {

    const { onChange, showToolbar } = props;
    const editor = useRef<JoditEditor>(null)
    const [content, setContent] = useState(props.content);

    const config = useMemo(() => ({
        readonly: false, // all options from https://xdsoft.net/jodit/doc/,
        placeholder: 'Start typings...',
        height: '100%',
        minHeight: "100%",
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        toolbar: showToolbar,
        allowResizeY: false,
        allowResizeX: false,
    }), [])

    return (
        <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onBlur={newContent => {
                setContent(newContent);
                //onChange(newContent)
            }} // preferred to use only this option to update the content for performance reasons
            onChange={onChange}
        />
    );
}

export const JoditRichTextEditorWrapper: React.FC<IJoditRichTextEditorProps> = (props) => {


    const onChange = (newContent: string) => {
        queueContentChange(newContent, props.onChange)
    }

    return <JoditRichTextEditor content={props.content} onChange={onChange} showToolbar={props.showToolbar} />
}


export class JoditRichTextEditorContainer implements IEditor {

    stringifySearchContent = (content: any) => content;

    render = (props: EditorProps) => <JoditRichTextEditorWrapper {...props} showToolbar={true} />;

    getDefaultContent = () => "";

    parse = (page: IPage) => page.content;

    stringify = (page: IPage) => page.content;

    type = PageType.RichText;
    icon = "bi bi-file-richtext-fill";
    displayName = "Rich Text";
}