import React from 'react';
import { ToolbarEditorProps } from '..';
import { ContentToolbarButtonGroup } from '../../toolbar/content-toolbar-button-group/ContentToolbarButtonGroup';
import { ContentToolbarHorizontalButton } from '../../toolbar/content-toolbar-buttons/ContentToolbarHorizontalButton';
import { ContentToolbarDivider } from '../../toolbar/content-toolbar-divider/ContentToolbarDivider';
import { ContentToolbarGroup } from '../../toolbar/content-toolbar-group/ContentToolbarGroup';
import { ContentToolbarLabel } from '../../toolbar/content-toolbar-label/ContentToolbarLabel';
import { IKanbanEditorApi } from './KanbanEditor';

export const KanbanEditorToolbar: React.FC<ToolbarEditorProps<IKanbanEditorApi>> = (props) => {

    const { editorApi } = props;

    return <>
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarHorizontalButton icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-card-text'></i><i className='bi bi-plus-circle-fill text-success bi-stacked-icon-action-circle'></i></div>} label='Add Card' onClick={editorApi.addCard} />
                <ContentToolbarHorizontalButton icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-layout-sidebar-inset'></i><i className='bi bi-plus-circle-fill text-success bi-stacked-icon-action-circle'></i></div>} label='Add Column' onClick={editorApi.addColumn} />
            </ContentToolbarButtonGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarHorizontalButton disabled icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-card-text'></i><i className='bi bi-x-circle-fill text-danger bi-stacked-icon-action-circle'></i></div>} label='Remove Card' onClick={() => void (0)} />
                <ContentToolbarHorizontalButton disabled icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-layout-sidebar-inset'></i><i className='bi bi-x-circle-fill text-danger bi-stacked-icon-action-circle'></i></div>} label='Remove Column' onClick={() => void (0)} />
                <ContentToolbarHorizontalButton icon={<i className='bi bi-archive'></i>} label='Show Archived Cards' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Kanban Actions' />
        </ContentToolbarGroup>
        <ContentToolbarDivider />
    </>
}