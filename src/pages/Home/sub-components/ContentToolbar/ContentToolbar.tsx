import { Component } from 'solid-js';
import { ContentToolbarButtonGroup } from '../ContentToolbarButtonGroup/ContentToolbarButtonGroup';
import { ContentToolbarTallButton } from '../ContentToolbarButtons/ContentToolbarTallButton';
import { ContentToolbarTallDropdownButton } from '../ContentToolbarButtons/ContentToolbarTallDropdownButton';
import { ContentToolbarDivider } from '../ContentToolbarDivider/ContentToolbarDivider';
import { ContentToolbarGroup } from '../ContentToolbarGroup/ContentToolbarGroup';
import { ContentToolbarLabel } from '../ContentToolbarLabel/ContentToolbarLabel';
import './ContentToolbar.scss';

export interface IContentToolbarProps {

}

export const ContentToolbar: Component<IContentToolbarProps> = (props) => {

    const { } = props;
    return <div class="page-content-toolbar-pane">
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarTallButton icon={<i class='bi bi-folder-plus'></i>} label='New Section' onClick={() => console.log('test')} />
                <ContentToolbarTallButton icon={<i class='bi bi-x-lg text-delete'></i>} label='Delete Section' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Section Actions' />
        </ContentToolbarGroup>
        <ContentToolbarDivider />
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarTallDropdownButton icon={<i class='bi bi-file-earmark-plus'></i>} label='New Page' onClick={() => void (0)} />
                <ContentToolbarTallButton icon={<i class='bi bi-x-lg text-delete'></i>} label='Delete Page' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Page Actions' />
        </ContentToolbarGroup>
        <ContentToolbarDivider />
    </div>
}