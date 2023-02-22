import { Button } from '@mui/material';
import React from 'react';

export interface IContentToolbarHorizontalButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

export const ContentToolbarHorizontalButton: React.FC<IContentToolbarHorizontalButtonProps> = (props) => {

    const { icon, label, onClick, disabled } = props;

    return <Button variant="contained" disabled={disabled} className="mui-horizontal-button" onClick={onClick}>
        <div className='mui-horizontal-button-icon-container'>
            {icon}
        </div>
        <span className='mui-horizontal-button-label'>&emsp;{label}</span>
    </Button>
}