import React, { useState } from 'react';
import { INote } from '../NotepadEditor';
import { SortableItem } from "react-easy-sort";
import { useMenuState, ControlledMenu, MenuItem } from '@szhsin/react-menu';

interface SortableProps {
    note: INote;
    onDelete: () => void;
    isSelected: boolean;
    onSelect: () => void;
    onRenameClick: () => void;
}

export const SortableTab: React.FC<SortableProps> = (props) => {

    const { note, onDelete, onRenameClick, isSelected, onSelect } = props;
    const [menuProps, toggleMenu] = useMenuState();
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

    const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        toggleMenu(true);
    }

    const classNames = ['sortable-tab'];

    if (isSelected) {
        classNames.push('sortable-tab-selected')
    }

    // on hover, show drag indicator

    return <SortableItem key={`notes-${note.title}`}>
        <div className={classNames.join(' ')} key={`notes-${note.title}-anchor`} onContextMenu={onContextMenu} onClick={onSelect}>
            <div><span>{note.title}</span><i className="bi bi-x-square text-danger" onClick={onDelete}></i></div>
            <ControlledMenu key={`notes-${note.title}-menu`} {...menuProps} anchorPoint={anchorPoint} onClose={() => toggleMenu(false)}>
                <MenuItem onClick={onRenameClick}>Rename</MenuItem>
            </ControlledMenu>
        </div >
    </SortableItem>
}