import './TextEditor.scss';
import React from 'react';
import { EditorProps, IEditor } from '..';
import { IPage, PageType } from '../../../data-access/entities/Page';
import { Button } from '@mui/material';
import { ContentToolbarButtonGroup } from '../../toolbar/content-toolbar-button-group/ContentToolbarButtonGroup';
import { ContentToolbarTallButton } from '../../toolbar/content-toolbar-buttons/ContentToolbarTallButton';
import { ContentToolbarGroup } from '../../toolbar/content-toolbar-group/ContentToolbarGroup';
import { ContentToolbarLabel } from '../../toolbar/content-toolbar-label/ContentToolbarLabel';

interface State {

}

class TextEditor extends React.PureComponent<EditorProps, State> {

    render() {
        return <div className="text-editor">
            <textarea value={this.props.content} onChange={e => this.props.onChange(e.target.value)} />
        </div>
    }
}

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

export class TextEditorContainer implements IEditor {
    stringifySearchContent = (content: string) => content;
    render = (props: EditorProps) => <TextEditor {...props} />;
    renderToolbar = (props: EditorProps) => <TextEditorHeader {...props} />;

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