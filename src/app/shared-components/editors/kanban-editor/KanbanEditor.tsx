import React, { forwardRef, PropsWithChildren, useState } from 'react';
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
import { ContentToolbarButtonGroup } from '../../toolbar/content-toolbar-button-group/ContentToolbarButtonGroup';
import { ContentToolbarHorizontalButton } from '../../toolbar/content-toolbar-buttons/ContentToolbarHorizontalButton';
import { ContentToolbarDivider } from '../../toolbar/content-toolbar-divider/ContentToolbarDivider';
import { ContentToolbarGroup } from '../../toolbar/content-toolbar-group/ContentToolbarGroup';
import { ContentToolbarLabel } from '../../toolbar/content-toolbar-label/ContentToolbarLabel';
import { ILinksEditorApi } from '../links-editor/LinksEditor';

const MarkDownEditor = forwardRef<ILinksEditorApi, PropsWithChildren<EditorProps>>((props, ref) => {

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
        <div className="editor-toolbar">
            <div className="editor-toolbar-row">
                <div className="editor-toolbar-button-group">
                    <button>
                        <i className="fas fa-plus" onClick={() => setIsAddColumnModalVisible(true)}></i>
                    </button>
                </div>
                <span className="separator"></span>
                <div className="editor-toolbar-button-group">
                    <button>
                        <i className="fas fa-bars fa-rotate-90"></i>
                    </button>
                </div>
            </div>
        </div>
        <div className="row search-row">
            <div className="col-sm-8">
                <input value={searchText} onChange={e => setSearchText(e.target.value)} className="form-control" placeholder="Search..." />
            </div>
            <div className="col-sm-4">
                <label>Show Archived Cards: </label>
                <input checked={showArchivedCards} onChange={e => setShowArchivedCards(e.target.checked)} className="form-control" type="checkbox" />
            </div>
        </div>
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

const KanbanEditorHeader: React.FC<EditorProps> = (props) => {

    return <>
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarHorizontalButton icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-card-text'></i><i className='bi bi-plus-circle-fill text-success bi-stacked-icon-action-circle'></i></div>} label='Add Card' onClick={() => void (0)} />
                <ContentToolbarHorizontalButton icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-layout-sidebar-inset'></i><i className='bi bi-plus-circle-fill text-success bi-stacked-icon-action-circle'></i></div>} label='Add Column' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarHorizontalButton disabled icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-card-text'></i><i className='bi bi-x-circle-fill text-danger bi-stacked-icon-action-circle'></i></div>} label='Remove Card' onClick={() => void (0)} />
                <ContentToolbarHorizontalButton disabled icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-layout-sidebar-inset'></i><i className='bi bi-x-circle-fill text-danger bi-stacked-icon-action-circle'></i></div>} label='Remove Column' onClick={() => void (0)} />
                <ContentToolbarHorizontalButton icon={<i className='bi bi-archive'></i>} label='Show Archived Cards' onClick={() => void (0)} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Kanban Actions' />
        </ContentToolbarGroup>
        <ContentToolbarDivider />
    </>
}

export const kanbanEditor: IEditor<EditorProps, IEditorApi> = {
    stringifySearchContent: (content: IBoard) => content.cards.map(w => `${w.name} ${w.content}`).join(" "),

    getComponent: () => MarkDownEditor,
    renderToolbar: (props: ToolbarEditorProps) => <KanbanEditorHeader {...props} />,
    getDefaultContent: () => ({ cards: [], columns: [] } as IBoard),

    parse: (page: IPage) => JSON.parse(page.content),

    stringify: (page: IPage) => JSON.stringify(page.content),

    type: PageType.Kanban,
    icon: "bi bi-kanban",
    displayName: "Kanban"
} 