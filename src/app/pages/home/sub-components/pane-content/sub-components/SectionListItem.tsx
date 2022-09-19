import React from 'react';
import { ISection } from '../../../../../data-access/entities/Section';
import { SortableItemUIProps } from '@progress/kendo-react-sortable';
import { ContextMenuOptions, SectionButton } from './SectionButton';


interface ISectionListItemProps extends SortableItemUIProps {
    onSelect: (id: string) => void;
    onContextMenuOptionClick: (option: ContextMenuOptions) => void;
}

export const SectionListItem: React.FC<ISectionListItemProps> = (props) => {
    const { dataItem, onSelect, ...rest } = props;
    const section = dataItem as ISection;

    return <SectionButton
        key={`section-key-${section._id}`}
        color={section.color}
        {...rest}
        dataItem={dataItem}
        className={section.isSelected === true ? 'nav-button-active' : ''}
        onClick={() => onSelect(section._id)}>{section.sectionName}
    </SectionButton>
}