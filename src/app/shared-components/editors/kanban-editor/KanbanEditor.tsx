import React, { forwardRef, PropsWithChildren, useImperativeHandle, useState } from 'react';
import './KanbanEditor.scss';
import { SortContainer } from './columns/sorting/SortContainer';
import { IBoard, ICard, IColumn } from './Sorting';
import { ButtonType, Modal } from '../../modal/Modal';
import { AddEditColumnModal } from './sub-components/AddEditColumnModal';
import { Column } from './sub-components/Column';
import { AddEditCardModal } from './sub-components/AddEditCardModal';
import { EditorProps, IEditor, IEditorApi, ToolbarEditorProps } from '..';
import { max } from 'radash';
import { IPage, PageType } from '../../../data-access/entities/Page';
import { IContextMenuItem } from '../../../../types';
import { KanbanEditorToolbar } from './KanbanEditorToolbar';

export interface IKanbanEditorApi extends IEditorApi {
    addColumn: () => void;
    addCard: () => Promise<void>;
    deleteColumn: () => void;
    deleteCard: () => void;
    showArchivedCards: () => void;
    hideArchivedCards: () => void;
}

const KanbanEditor = forwardRef<IKanbanEditorApi, PropsWithChildren<EditorProps>>((props, ref) => {

    const { content, onChange } = props;
    const board = content as IBoard;
    const columns = [...board.columns ?? []];
    const cards = [...board.cards ?? []];
    const getNextColumnId = () => (max(columns.map(w => w.id)) ?? 0) + 1;

    const sumColumnIds: number[] = (content as IBoard).columns.filter(w => w.name.toLowerCase().includes("new") || w.name.toLowerCase().includes("progress")).map(w => w.id)
    const [deleteColumn, setDeleteColumn] = useState<IColumn | null>(null);
    const [isAddColumnModalVisible, setIsAddColumnModalVisible] = useState<boolean>(false);
    const [addEditCard, setAddEditCard] = useState<ICard | null>(null);
    const [deleteCard, setDeleteCard] = useState<ICard | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [showArchivedCards, setShowArchivedCards] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        addCard: async () => {

            if (columns.length === 0) {
                return;
            }

            await onAddCard(columns[0])
        },
        addColumn: () => setIsAddColumnModalVisible(true),
        deleteCard: () => {

        },
        deleteColumn: () => {
            
        },
        hideArchivedCards: () => void(0),
        showArchivedCards: () => void(0)
    }), []);

    const onDragChange = (data: IColumn[]) => {
        const board: IBoard = content as IBoard;
        board.columns = [...data];
        onChange(board);
    }

    const onColumnChange = (column: IColumn) => {
        const board: IBoard = content as IBoard;
        const columnIndex = board.columns.findIndex(w => w.id === column.id);
        board.columns[columnIndex] = column
        onChange(board);
    }

    const handleDeleteColumn = (button: ButtonType) => {

        if (button !== "Yes") {
            setDeleteColumn(null)
            return;
        }

        const board: IBoard = content as IBoard;
        const index = board.columns.findIndex(w => w.id === deleteColumn?.id);
        board.columns.splice(index, 1);
        board.cards = board.cards.filter(w => w.columnId !== deleteColumn?.id);
        onChange(board);
        setDeleteColumn(null)
    }

    const handleDeleteCard = (button: ButtonType) => {

        if (button !== "Yes") {
            setDeleteCard(null)
            return;
        }

        const board: IBoard = content as IBoard;
        const index = board.cards.findIndex(w => w.id === deleteCard?.id);
        board.cards.splice(index, 1);
        onChange(board);
        setDeleteCard(null);
    }

    const onArchiveCardClick = async (card: ICard) => {
        const board: IBoard = content as IBoard;
        const index = board.cards.findIndex(w => w.id === card.id);
        board.cards[index].isArchived = true;
        onChange(board);
    }

    const onAddColumn = (column: IColumn) => {
        const board: IBoard = content as IBoard;
        const columns = [...board.columns];
        columns.push(column);
        board.columns = columns;
        onChange(board);
        setIsAddColumnModalVisible(false)
    }

    const onAddCard = async (column: IColumn) => {
        const date = new Date();
        const card: ICard = {
            columnId: column.id,
            content: "",
            id: 0,
            name: "",
            dateAdded: date,
            dateEdited: date,
            priority: -1,
            isArchived: false,
            comments: [],
            dueDate: null
        }

        await onAddEditCard(card);
        setAddEditCard(card)
    }

    const onAddCardSuccess = async (card: ICard) => {
        await onAddEditCard(card);
        setAddEditCard(null)
    }

    const onAddEditCard = async (card: ICard) => {
        const board: IBoard = content as IBoard;
        const cards = [...board.cards ?? []];

        if (card.id <= 0) {
            // add
            card.id = (max(cards.map(w => w.id)) ?? 0) + 1


            cards.unshift(card);
            board.cards = cards;
        } else {
            const cardIndex = cards.findIndex(w => w.id === card.id);
            board.cards[cardIndex] = { ...card };
        }

        // delete previous notifications?

        onChange(board);
    }

    const onCardsChange = (cards: ICard[]) => {
        const board: IBoard = content as IBoard;
        board.cards = cards;
        const sum = cards.filter(w => sumColumnIds.includes(w.columnId)).length;
        onChange(board, sum);
    }

    const columnContextMenuItems = () => {
        const items: IContextMenuItem<IColumn>[] = [
            { name: "Add Card", onClick: onAddCard },
            { name: "Rename Column", onClick: async () => void (0) },
            { name: "Delete Card", onClick: async c => setDeleteColumn(c) }
        ]
        return items;
    }

    const cardContextMenuItems = () => {
        const items: IContextMenuItem<ICard>[] = [
            { name: "Edit Card", onClick: async c => setAddEditCard(c) },
            { name: "Archive Card", onClick: onArchiveCardClick },
            { name: "Delete Card", onClick: async c => setDeleteCard(c) }
        ]
        return items;
    }


    return <div className="kanban-editor">
        {/* <div className="row search-row">
            <div className="col-sm-8">
                <input value={searchText} onChange={e => setSearchText(e.target.value)} className="form-control" placeholder="Search..." />
            </div>
            <div className="col-sm-4">
                <label>Show Archived Cards: </label>
                <input checked={showArchivedCards} onChange={e => setShowArchivedCards(e.target.checked)} className="form-control" type="checkbox" />
            </div>
        </div> */}
        <div className="column-container">
            <SortContainer
                itemUI={(e, i) => <Column
                    searchText={searchText}
                    archivedCardsVisible={showArchivedCards}
                    cards={cards}
                    column={e}
                    key={`column-${i}`}
                    index={i}
                    onChange={onCardsChange}
                    columnContextMenuItems={columnContextMenuItems()}
                    cardContextMenuItems={cardContextMenuItems()}
                />}
                data={columns}
                onChange={onDragChange}
            />
        </div>
        {deleteCard != null && <Modal
            buttons={["Yes", "Cancel"]}
            onClick={handleDeleteCard}
            title="Delete Card?"
        >
            <p>Are you sure you want to delete the card {deleteCard.name}?</p>
        </Modal>}
        {deleteColumn != null && <Modal
            buttons={["Yes", "Cancel"]}
            onClick={handleDeleteColumn}
            title="Delete Column?"
        >
            <p>Are you sure you want to delete the column {deleteColumn.name}?</p>
        </Modal>}
        {isAddColumnModalVisible && <AddEditColumnModal
            getNextId={getNextColumnId}
            onClose={() => setIsAddColumnModalVisible(false)}
            onSuccess={onAddColumn}
        />}
        {addEditCard && <AddEditCardModal
            card={addEditCard}
            onClose={() => setAddEditCard(null)}
            onSuccess={onAddCardSuccess}
        />}
    </div>
});

export const kanbanEditor: IEditor<EditorProps, IKanbanEditorApi> = {
    stringifySearchContent: (content: IBoard) => content.cards.map(w => `${w.name} ${w.content}`).join(" "),

    getComponent: () => KanbanEditor,
    renderToolbar: (props: ToolbarEditorProps<IKanbanEditorApi>) => <KanbanEditorToolbar {...props} />,
    getDefaultContent: () => ({ cards: [], columns: [] } as IBoard),

    parse: (page: IPage) => JSON.parse(page.content),

    stringify: (page: IPage) => JSON.stringify(page.content),

    type: PageType.Kanban,
    icon: "bi bi-kanban",
    displayName: "Kanban"
} 