import React, { useEffect } from 'react';
import { ICard, IColumn } from '../Sorting';
import { CardSortContainer } from '../cards/sorting/CardSortContainer';
import moment from 'moment';
import { Menu, MenuItem } from '@szhsin/react-menu';
import { IContextMenuItem } from '../../../../../types';

interface ColumnProps {
    searchText: string;
    archivedCardsVisible: boolean;
    column: IColumn;
    cards: ICard[];
    index: number;
    onChange: (cards: ICard[]) => void;
    columnContextMenuItems: IContextMenuItem<IColumn>[];
    cardContextMenuItems: IContextMenuItem<ICard>[];
}

export const Column: React.FunctionComponent<ColumnProps> = (props) => {

    const { columnContextMenuItems, column, cardContextMenuItems } = props;

    useEffect(() => {

        [...document.getElementsByClassName("kanban-card-body")].forEach(e => {

            if (e.clientHeight >= 100) {
                e.classList.add("kanban-card-more");
            } else {
                e.classList.remove("kanban-card-more");
            }

        });
    });

    const count = props.cards.filter(w => w.columnId === props.column.id && w.isArchived === false).length;

    return <div className="kanban-column">
        <div className="kanban-column-header">
            <span className="badge badge-secondary kanban-column-header-count">{count}</span>
            {props.column.name}
            <Menu menuButton={<i className="bi bi-three-dots kanban-column-header-button clickable"></i>} transition>
                {columnContextMenuItems.map(w => <MenuItem key={w.name} onClick={() => w.onClick(column)}>{w.name}</MenuItem>)}
            </Menu>
        </div>
        <hr />
        <CardSortContainer
            archivedCardsVisible={props.archivedCardsVisible}
            searchText={props.searchText}
            index={props.index}
            data={props.cards}
            column={props.column}
            itemUI={(card, i) => <div key={`kanban-card-${props.column.id}-${i}`} className={`kanban-card${card.isArchived ? " kanban-card-archived" : ""}`}>
                <div className="kanban-card-header">
                    <i className="bi bi-card-text"></i>&nbsp;<span className="kanban-card-header-title">{card.name}</span>
                    <Menu menuButton={<i className="bi bi-three-dots kanban-card-header-actions clickable"></i>} transition>
                        {cardContextMenuItems.map(x => <MenuItem key={x.name} onClick={() => x.onClick(card)}>{x.name}</MenuItem>)}
                    </Menu>
                    <div className="kanban-card-sub-header">
                        {card.dateEdited && <small>{moment(card.dateEdited).format('MM/DD/YYYY, h:mm A')}</small>}
                    </div>
                    {card.priority != -1 && <div className="kanban-card-sub-header">
                        {card.priority != null && <small>Priority: {card.priority}</small>}
                    </div>}
                </div>
                {card.content && <hr className="kanban-card-separator" />}
                <div className="kanban-card-body">
                    <p dangerouslySetInnerHTML={{ __html: parseContent(card.content) }}></p>
                    <div className="more text-center">More +</div>
                </div>
            </div>}
            onChange={props.onChange} />
    </div>
}

const parseContent = (content: string) => {

    const regex = /(#Page::)([0-9]*)(::[A-z0-9]*)/g;
    const match = content.match(regex);

    if (match == null) {
        return content;
    }

    let result = content;
    match.forEach(value => {

        const split = value.split("::");
        result = result.replace(value, `<a data-link="${split[0]}:${split[1]}">#${split[2].replace(/_/g, ' ')}</a>`);
    });

    return result;
}