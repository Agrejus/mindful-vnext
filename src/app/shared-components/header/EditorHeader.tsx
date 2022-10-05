import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import './EditorHeader.scss';

interface IEditorHeaderProps {
    quickAccessUI: () => React.ReactNode;
    expandedUI?: () => React.ReactNode
}

export const EditorHeader: React.FunctionComponent<IEditorHeaderProps> = (props) => {

    const {quickAccessUI, expandedUI} = props;

    return <Accordion>
        <AccordionSummary
            expandIcon={<i className='fa fa-caret-down'></i>}
            aria-controls="editor-header-content"
            id="editor-header-header"
        >
            {quickAccessUI()}
        </AccordionSummary>
        <AccordionDetails>
            {!!expandedUI && expandedUI()}
        </AccordionDetails>
    </Accordion>
}