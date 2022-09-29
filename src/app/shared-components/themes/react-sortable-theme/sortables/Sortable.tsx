import React from 'react';

interface SortableProps {
    keyPart: string;
    onClick: (id: string) => void;
    idField: string;
    displayField: string;
    icon?: string;
    dataItem: any;
    className?: string;
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    isDirty?: boolean;
}

export const Sortable: React.FunctionComponent<SortableProps> = (props) => {

    const click = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        props.onClick(props.dataItem[props.idField]);
    }

    let additionalClassNames = ['nav-button'];

    if (props.className) {
        additionalClassNames = additionalClassNames.concat(props.className.split(' '));
    }


    const style: React.CSSProperties = {
        cursor: "pointer",
        position: "relative"
    };
    const className = additionalClassNames.join(' ');

    return <div className={className} onClick={click} style={{ ...style }} onContextMenu={props.onContextMenu}>

        {props.isDirty === true && <i className="fas fa-circle dirty-icon"></i>}
        {!!props.icon && <><i className={`${props.icon} icon-md display-icon`}></i>&nbsp;</>}
        {props.dataItem[props.displayField]}
        {props.children}
    </div>
}