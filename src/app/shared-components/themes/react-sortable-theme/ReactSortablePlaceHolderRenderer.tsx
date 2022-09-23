import React from 'react';
import { PlaceholderRendererProps } from 'react-sortable-tree';
import { IPage } from '../../../data-access/entities/Page';
import { classnames } from './utils';

export const ReactSortablePlaceHolderRenderer: React.FunctionComponent<PlaceholderRendererProps<IPage>> = (props) => {

    const { canDrop, isOver } = props;

    const className = classnames(
        'rst__placeholder',
        canDrop && 'rst__placeholderLandingPad',
        canDrop && !isOver && 'rst__placeholderCancelPad'
    );
    
    return <div className={className} />
}