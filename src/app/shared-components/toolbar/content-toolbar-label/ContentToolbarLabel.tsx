import React from 'react';

export interface IContentToolbarLabelProps {
    name: string;
}

export const ContentToolbarLabel: React.FC<IContentToolbarLabelProps> = (props) => {

    const { name } = props;

    return <div className='page-content-toolbar-group-label'>{name}</div>
}