import { Button } from '@mui/material';
import React from 'react';

export interface IContentToolbarTallDropdownButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

export const ContentToolbarTallDropdownButton: React.FC<IContentToolbarTallDropdownButtonProps> = (props) => {

    const { icon, label, onClick } = props;

    return <Button variant="contained" className="mui-tall-button mui-tall-button-dropdown" onClick={onClick}>
        <div className='mui-tall-button-icon-container'>
            {icon}
        </div>
        <span className='mui-tall-button-label'>{label.split(' ').map((w, i) => <>{w}{i % 2 === 0 ? <br/> : null}</>)}</span>
        <i className="bi bi-caret-down-fill"></i>
    </Button>
}