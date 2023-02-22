import { Button, Popover, Typography } from '@mui/material';
import React, { useState } from 'react';

export interface IContentToolbarTallDropdownButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

export const ContentToolbarTallDropdownButton: React.FC<IContentToolbarTallDropdownButtonProps> = (props) => {

    const { icon, label, onClick } = props;
    const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);

    const open = Boolean(anchorElement);
    const id = open ? 'mui-tall-button-popover' : undefined;

    return <>
        <Button variant="contained" className="mui-tall-button mui-tall-button-dropdown" onClick={e => setAnchorElement(e.currentTarget)}>
            <div className='mui-tall-button-icon-container'>
                {icon}
            </div>
            <span className='mui-tall-button-label'>{label.split(' ').map((w, i) => <>{w}{i % 2 === 0 ? <br /> : null}</>)}</span>
            <i className="bi bi-caret-down-fill"></i>
        </Button>
        <Popover
            className='mui-tall-button-dropdown-pop-over'
            id={id}
            open={open}
            anchorEl={anchorElement}
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