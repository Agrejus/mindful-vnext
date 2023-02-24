import React from 'react';
import { IEditorApi, renderToolbar } from '../../editors';
import { ISection } from '../../../data-access/entities/Section';
import { IPage } from '../../../data-access/entities/Page';
import './ContentToolbar.scss';
import { Button } from '@mui/material';
import { ContentToolbarTallButton } from '../content-toolbar-buttons/ContentToolbarTallButton';
import { ContentToolbarTallDropdownButton } from '../content-toolbar-buttons/ContentToolbarTallDropdownButton';
import { ContentToolbarLabel } from '../content-toolbar-label/ContentToolbarLabel';
import { ContentToolbarButtonGroup } from '../content-toolbar-button-group/ContentToolbarButtonGroup';
import { ContentToolbarGroup } from '../content-toolbar-group/ContentToolbarGroup';
import { ContentToolbarDivider } from '../content-toolbar-divider/ContentToolbarDivider';

interface IContentToolbarProps {
    onChange: (content: any) => void;
    editorApi: IEditorApi | null;
    page?: IPage;
    section?: ISection;
    onAddPageClick: () => void;
    onAddSectionClick: () => void;
    onDeletePageClick: () => void;
    onDeleteSectionClick: () => void;
}

export const ContentToolbar: React.FunctionComponent<IContentToolbarProps> = (props) => {

    const { onChange, page, editorApi } = props;
    return <div className="page-content-toolbar-pane">
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarTallButton icon={<i className='bi bi-folder-plus'></i>} label='New Section' onClick={() => console.log(editorApi)} />
                <ContentToolbarTallButton icon={<i className='bi bi-x-lg text-delete'></i>} label='Delete Section' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Section Actions' />
        </ContentToolbarGroup>
        <ContentToolbarDivider />
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarTallDropdownButton icon={<i className='bi bi-file-earmark-plus'></i>} label='New Page' onClick={() => void(0)} />
                <ContentToolbarTallButton icon={<i className='bi bi-x-lg text-delete'></i>} label='Delete Page' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Page Actions' />
        </ContentToolbarGroup>
        <ContentToolbarDivider />
        {page && editorApi && renderToolbar(page.pageType, {
            content: page.content,
            onChange: onChange,
            editorApi
        })}
    </div>
}