import './TextEditor.scss';
import React from 'react';
import { EditorProps, IEditor } from '..';
import { IPage, PageType } from '../../../data-access/entities/Page';

interface State {

}

class TextEditor extends React.PureComponent<EditorProps, State> {

    render() {
        return <div className="text-editor">
            <textarea value={this.props.content} onChange={e => this.props.onChange(e.target.value)} />
        </div>
    }
}

export class TextEditorContainer implements IEditor {
    stringifySearchContent = (content: string) => content;
    render = (props: EditorProps) => <TextEditor {...props} />;

    getDefaultContent = () => "";

    parse = (page: IPage) => {
        return page.content;
    }

    stringify = (page: IPage) => {
        return page.content;
    }

    type = PageType.PlainText;
    icon = "bi bi-file-text";
    displayName = "Plain Text";
}