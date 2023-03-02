import { Button, Popover, Typography } from '@suid/material';
import { Component, JSXElement, createSignal } from 'solid-js';
import { createStore } from "solid-js/store";

export interface IContentToolbarTallDropdownButtonProps {
    icon: JSXElement;
    label: string;
    onClick: () => void;
}

export const ContentToolbarTallDropdownButton: Component<IContentToolbarTallDropdownButtonProps> = (props) => {

    const { icon, label, onClick } = props;
    const [anchorElement, setAnchorElement] = createSignal<HTMLButtonElement | null>(null);

    const open = () => Boolean(anchorElement());
    const id = () => (open() ? "mui-tall-button-popover" : undefined);
    return <>
        <Button variant="contained" class="mui-tall-button mui-tall-button-dropdown" onClick={e => setAnchorElement(e.currentTarget)}>
            <div class='mui-tall-button-icon-container'>
                {icon}
            </div>
            <span class='mui-tall-button-label'>{label.split(' ').map((w, i) => <>{w}{i % 2 === 0 ? <br /> : null}</>)}</span>
            <i class="bi bi-caret-down-fill"></i>
        </Button>
        <Popover
            class='mui-tall-button-dropdown-pop-over'
            id={id()}
            open={open()}
            anchorEl={anchorElement()}
            onClose={() => setAnchorElement(null)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
        >
            <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
            <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
            <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
        </Popover>
    </>
}