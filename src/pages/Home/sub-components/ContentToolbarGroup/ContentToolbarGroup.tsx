import { Component, JSXElement } from 'solid-js';

export interface IContentToolbarGroupProps {
    children: JSXElement;
}

export const ContentToolbarGroup: Component<any> = (props) => {

    const { children } = props;

    return <div class='page-content-toolbar-group'>
        {children}
    </div>


}