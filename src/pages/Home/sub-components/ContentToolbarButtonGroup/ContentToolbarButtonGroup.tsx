import { Component, JSXElement } from 'solid-js';

export interface IContentToolbarButtonGroupProps {
    children: JSXElement;
}

export const ContentToolbarButtonGroup: Component<IContentToolbarButtonGroupProps> = (props) => {

    const { children } = props;

    return <div class='page-content-toolbar-button-group'>
        {children}
    </div>
}