import { Button } from '@mui/material';
import React from 'react';

export interface IContentToolbarHorizontalButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

export const ContentToolbarHorizontalButton: React.FC<IContentToolbarHorizontalButtonProps> = (props) => {

    const { icon, label, onClick } = props;

    return <Button variant="contained" className="mui-horizontal-button" onClick={onClick}>
        <div className='mui-horizontal-button-icon-container'>
            {icon}
        </div>
        <span className='mui-horizontal-button-label'>&emsp;{label}</span>
    </Button>
}