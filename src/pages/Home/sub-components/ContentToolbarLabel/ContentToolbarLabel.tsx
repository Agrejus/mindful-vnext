import { Component } from 'solid-js';

export interface IContentToolbarLabelProps {
    name: string;
}

export const ContentToolbarLabel: Component<IContentToolbarLabelProps> = (props) => {

    const { name } = props;

    return <div class='page-content-toolbar-group-label'>{name}</div>
}