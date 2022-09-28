import React, { useState } from 'react';
import { Sortable } from './Sortable';
import { getIconClass } from '../../../editors/index';
import { IPage } from '../../../../data-access/entities/Page';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';

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
    const [menuProps, toggleMenu] = useMenuState();
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

    const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        toggleMenu(true);
    };

    return <Sortable
        className='page-item-button'
        keyPart="page-sortable-key"
        displayField="pageName"
        icon={getIconClass(node.pageType)}
        idField={'_id'}
        onClick={onClick}
        dataItem={node}
        onContextMenu={onContextMenu}>
        <ControlledMenu {...menuProps} anchorPoint={anchorPoint} onClose={() => toggleMenu(false)}>
            <MenuItem onClick={() => onMenuClick(PageSortableMenuAction.Rename)}><i className='fas fa-i-cursor'></i>&nbsp;Rename</MenuItem>
            <MenuItem onClick={() => onMenuClick(PageSortableMenuAction.Duplicate)}><i className='far fa-clone'></i>&nbsp;Duplicate</MenuItem>
            <MenuItem onClick={() => onMenuClick(PageSortableMenuAction.Delete)}><i className='far fa-trash-alt text-danger'></i>&nbsp;Delete</MenuItem>
        </ControlledMenu>
    </Sortable>
}