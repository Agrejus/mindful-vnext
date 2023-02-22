import React from 'react';

export interface IContentToolbarGroupProps {
    children: React.ReactNode;
}

export const ContentToolbarGroup: React.FC<IContentToolbarGroupProps> = (props) => {

    const { children } = props;

    return <div className='page-content-toolbar-group'>
        {children}
    </div>


}