import React from 'react';

interface SortableProps {
    keyPart: string;
    onClick: (id: string) => void;
    idField: string;
    displayField: string;
    icon?: string;
    dataItem: any;
    className?: string;
    onContextMenu?:(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const Sortable: React.FunctionComponent<SortableProps> = (props) => {

    const click = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        props.onClick(props.dataItem[props.idField]);
    }

    let additionalClassNames = ['nav-button'];

    if (props.className) {
        additionalClassNames = additionalClassNames.concat(props.className.split(' '));
    }

    const spanStyle: React.CSSProperties = {
        backgroundColor: props.dataItem.color,
        position: "absolute",
        width: "10px",
        top: 0,
        bottom: 0,
        left: 0,
        borderTopLeftRadius: "5px",
        borderBottomLeftRadius: "5px"
    };

    const style: React.CSSProperties = {
        cursor: "pointer"
    };
    const className = additionalClassNames.join(' ');

    return <div className={className} onClick={click} style={{ ...style }} onContextMenu={props.onContextMenu}>
        {!!props.dataItem.color && <><span style={spanStyle}></span>&nbsp;</>}
        {!!props.icon && <><i className={`${props.icon} icon-md display-icon`}></i>&nbsp;</>}
        {props.dataItem[props.displayField]}
        {props.children}
    </div>
}