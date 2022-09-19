import { SortableItemUIProps } from '@progress/kendo-react-sortable';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { useMenuPreventDefault } from '../../../../../../utilities/hooks';
import React, { useState } from 'react';

export enum ContextMenuOptions {
    Rename,
    ChangeColor,
    Widgets,
    Archive,
    Settings,
    Delete
}

export interface ISectionButtonProps extends SortableItemUIProps {
    color?: string;
    onClick: () => void;
    className?: string;
    onContextMenuOptionClick: (option: ContextMenuOptions) => void;
}

export const SectionButton: React.FunctionComponent<ISectionButtonProps> = (props) => {

    const { color, onClick, className, attributes, style, isDragCue, isDragged, forwardRef, onContextMenuOptionClick, dataItem } = props;
    const [menuProps, toggleMenu] = useMenuState();
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

    const additionalClassNames = ['nav-button'];

    const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        toggleMenu(true);
    };


    if (className) {
        additionalClassNames.push(...className.split(' '));
    }

    const spanStyle: React.CSSProperties = {
        backgroundColor: color,
        position: "absolute",
        width: 10,
        top: 0,
        bottom: 0,
        left: 0,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5
    };

    const divStyle = {
        ...style,
        cursor: "pointer"
    }
    const classNames = additionalClassNames.join(' ');

    const onClickHandler = () => {
        if (isDragCue === false && isDragged === false) {
            onClick();
        }
    }

    return <div className={classNames} onClick={onClickHandler} ref={forwardRef} {...attributes} style={divStyle} onContextMenu={onContextMenu}>
        {!!color && <><span style={spanStyle}></span>&nbsp;</>}
        {dataItem.sectionName}
        <ControlledMenu {...menuProps} anchorPoint={anchorPoint} onClose={() => toggleMenu(false)}>
            <MenuItem onClick={useMenuPreventDefault(() => onContextMenuOptionClick(ContextMenuOptions.Rename))}><i className='fas fa-i-cursor'></i>&nbsp;Rename</MenuItem>
            <MenuItem onClick={useMenuPreventDefault(() => onContextMenuOptionClick(ContextMenuOptions.ChangeColor))}><i className='fas fa-palette'></i>&nbsp;Change Color</MenuItem>
            <MenuItem onClick={useMenuPreventDefault(() => onContextMenuOptionClick(ContextMenuOptions.Widgets))}><i className={dataItem?.widgets && dataItem.widgets.length > 0 ? "bi bi-app-indicator" : "bi bi-app"}></i>&nbsp;Widgets</MenuItem>
            <MenuItem onClick={useMenuPreventDefault(() => onContextMenuOptionClick(ContextMenuOptions.Archive))}><i className='fas fa-archive'></i>&nbsp;Archive</MenuItem>
            <MenuItem onClick={useMenuPreventDefault(() => onContextMenuOptionClick(ContextMenuOptions.Settings))}><i className='fa fa-cogs'></i>&nbsp;Settings</MenuItem>
            <MenuItem onClick={useMenuPreventDefault(() => onContextMenuOptionClick(ContextMenuOptions.Delete))}><i className='far fa-trash-alt text-danger'></i>&nbsp;Delete</MenuItem>
        </ControlledMenu>
    </div>
}