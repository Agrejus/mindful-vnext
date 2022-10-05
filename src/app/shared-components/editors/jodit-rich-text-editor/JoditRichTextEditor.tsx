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

const JoditRichTextEditor: React.FunctionComponent<{ content: any, onChange: (content: string) => void }> = (props) => {

    const { onChange } = props;
    const editor = useRef<JoditEditor>(null)
    const [content, setContent] = useState(props.content);

    const config = useMemo(() => ({
        readonly: false, // all options from https://xdsoft.net/jodit/doc/,
        placeholder: 'Start typings...',
        height: '100%',
        resize: false
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

// const Memo = React.memo(JoditRichTextEditor);

const JoditRichTextEditorWrapper: React.FC<EditorProps> = (props) => {


    const onChange = (newContent: string) => {
        queueContentChange(newContent, props.onChange)
    }

    return <JoditRichTextEditor content={props.content} onChange={onChange}/>
}


export class JoditRichTextEditorContainer implements IEditor {

    stringifySearchContent = (content: any) => content;

    render = (props: EditorProps) => <JoditRichTextEditorWrapper {...props} />;

    getDefaultContent = () => "";

    parse = (page: IPage) => page.content;

    stringify = (page: IPage) => page.content;

    type = PageType.RichText;
    icon = "bi bi-file-richtext-fill";
    displayName = "Rich Text";
}