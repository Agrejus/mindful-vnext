import { Button } from '@suid/material';
import { Component, JSXElement } from 'solid-js';

export interface IContentToolbarTallButtonProps {
    icon: JSXElement;
    label: string;
    onClick: () => void;
}

export const ContentToolbarTallButton: Component<IContentToolbarTallButtonProps> = (props) => {

    const { icon, label, onClick } = props;

    return <Button variant="contained" class="mui-tall-button" onClick={onClick}>
        <div class='mui-tall-button-icon-container'>
            {icon}
        </div>
        <span class='mui-tall-button-label'>{label.split(' ').map((w, i) => <>{w}{i % 2 === 0 ? <br /> : null}</>)}</span>
    </Button>
}