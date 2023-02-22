import { Button } from '@mui/material';
import React from 'react';

export interface IContentToolbarTallButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

export const ContentToolbarTallButton: React.FC<IContentToolbarTallButtonProps> = (props) => {

    const { icon, label, onClick } = props;

    return <Button variant="contained" className="mui-tall-button" onClick={onClick}>
        <div className='mui-tall-button-icon-container'>
            {icon}
        </div>
        <span className='mui-tall-button-label'>{label.split(' ').map((w, i) => <>{w}{i % 2 === 0 ? <br /> : null}</>)}</span>
    </Button>
}