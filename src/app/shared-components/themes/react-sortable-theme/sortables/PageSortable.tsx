import React from 'react';
import { Sortable } from './Sortable';
import { getIconClass } from '../../../editors/index';
import { IPage } from '../../../../data-access/entities/Page';
import { Menu, MenuItem } from '@szhsin/react-menu';

export enum PageSortableMenuAction {
    Rename, 
    Duplicate,
    Delete,
    Select
}

interface PageSortableProps {
    node: IPage;
    onMenuClick: (action: PageSortableMenuAction) => void;
    onClick: () => void;
}

export const PageSortable: React.FC<PageSortableProps> = (props) => {

    const { node, onMenuClick, onClick } = props;
    
    return <Sortable
        className="page-item-button"
        keyPart="page-sortable-key"
        displayField="title"
        icon={getIconClass(node.pageType)}
        idField={'_id'}
        onClick={onClick}
        dataItem={node}>
        <Menu menuButton={<i className="bi bi-three-dots-vertical kanban-card-header-actions clickable pull-right" onClick={e => { e.preventDefault(); e.stopPropagation(); }}></i>} transition>
            <MenuItem onClick={() => onMenuClick(PageSortableMenuAction.Rename)}><i className='fas fa-i-cursor'></i>&nbsp;Rename</MenuItem>
            <MenuItem onClick={() => onMenuClick(PageSortableMenuAction.Duplicate)}><i className='far fa-clone'></i>&nbsp;Duplicate</MenuItem>
            <MenuItem onClick={() => onMenuClick(PageSortableMenuAction.Delete)}><i className='far fa-trash-alt text-danger'></i>&nbsp;Delete</MenuItem>
        </Menu>
    </Sortable>
}