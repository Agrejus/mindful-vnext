import React from 'react';

export interface IContentToolbarButtonGroupProps {
    children: React.ReactNode;
}

export const ContentToolbarButtonGroup: React.FC<IContentToolbarButtonGroupProps> = (props) => {

    const { children } = props;

    return <div className='page-content-toolbar-button-group'>
        {children}
    </div>
}