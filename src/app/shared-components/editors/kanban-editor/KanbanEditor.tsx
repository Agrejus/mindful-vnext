import React from 'react';
import './KanbanEditor.scss';
import { SortContainer } from './columns/sorting/SortContainer';
import { IBoard, ICard, IColumn } from './Sorting';
import { ButtonType, Modal } from '../../modal/Modal';
import { AddEditColumnModal } from './sub-components/AddEditColumnModal';
import { Column } from './sub-components/Column';
import { AddEditCardModal } from './sub-components/AddEditCardModal';
import { EditorProps, IEditor } from '..';
import { max } from 'radash';
import { IPage, PageType } from '../../../data-access/entities/Page';
import { IContextMenuItem } from '../../../../types';
import { ContentToolbarButtonGroup } from '../../toolbar/content-toolbar-button-group/ContentToolbarButtonGroup';
import { ContentToolbarHorizontalButton } from '../../toolbar/content-toolbar-buttons/ContentToolbarHorizontalButton';
import { ContentToolbarDivider } from '../../toolbar/content-toolbar-divider/ContentToolbarDivider';
import { ContentToolbarGroup } from '../../toolbar/content-toolbar-group/ContentToolbarGroup';
import { ContentToolbarLabel } from '../../toolbar/content-toolbar-label/ContentToolbarLabel';

interface State {
    deleteColumn: IColumn | null;
    deleteCard: ICard | null;
    isAddColumnModalVisible: boolean;
    addEditCard: ICard | null;
    showArchivedCards: boolean;
    searchText: string;
}

class KanbanEditor extends React.Component<EditorProps, State> {

    sumColumnIds: number[] = (this.props.content as IBoard).columns.filter(w => w.name.toLowerCase().includes("new") || w.name.toLowerCase().includes("progress")).map(w => w.id)
    state: State = {
        deleteColumn: null,
        isAddColumnModalVisible: false,
        addEditCard: null,
        deleteCard: null,
        showArchivedCards: false,
        searchText: ""
    }

    onDragChange = (data: IColumn[]) => {
        const board: IBoard = this.props.content as IBoard;
        board.columns = [...data];
        this.props.onChange(board);
    }

    onColumnChange = (column: IColumn) => {
        const board: IBoard = this.props.content as IBoard;
        const columnIndex = board.columns.findIndex(w => w.id === column.id);
        board.columns[columnIndex] = column
        this.props.onChange(board);
    }

    handleDeleteColumn = (button: ButtonType) => {

        if (button !== "Yes") {
            this.setState({ deleteColumn: null });
            return;
        }

        const board: IBoard = this.props.content as IBoard;
        const index = board.columns.findIndex(w => w.id === this.state.deleteColumn?.id);
        board.columns.splice(index, 1);
        board.cards = board.cards.filter(w => w.columnId !== this.state.deleteColumn?.id);
        this.props.onChange(board);
        this.setState({ deleteColumn: null });
    }

    handleDeleteCard = (button: ButtonType) => {

        if (button !== "Yes") {
            this.setState({ deleteCard: null });
            return;
        }

        const board: IBoard = this.props.content as IBoard;
        const index = board.cards.findIndex(w => w.id === this.state.deleteCard?.id);
        board.cards.splice(index, 1);
        this.props.onChange(board);
        this.setState({ deleteCard: null });
    }

    onArchiveCardClick = async (card: ICard) => {
        const board: IBoard = this.props.content as IBoard;
        const index = board.cards.findIndex(w => w.id === card.id);
        board.cards[index].isArchived = true;
        this.props.onChange(board);
    }

    onAddColumn = (column: IColumn) => {
        const board: IBoard = this.props.content as IBoard;
        const columns = [...board.columns];
        columns.push(column);
        board.columns = columns;
        this.props.onChange(board);
        this.setState({ isAddColumnModalVisible: false });
    }

    onAddCard = async (column: IColumn) => {
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

        await this.onAddEditCard(card);
        this.setState({ addEditCard: card })
    }

    onAddCardSuccess = async (card: ICard) => {
        await this.onAddEditCard(card);
        this.setState({ addEditCard: null })
    }

    onAddEditCard = async (card: ICard) => {
        const board: IBoard = this.props.content as IBoard;
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

        this.props.onChange(board);
    }

    onCardsChange = (cards: ICard[]) => {
        const board: IBoard = this.props.content as IBoard;
        board.cards = cards;
        const sum = cards.filter(w => this.sumColumnIds.includes(w.columnId)).length;
        this.props.onChange(board, sum);
    }

    columnContextMenuItems = () => {
        const items: IContextMenuItem<IColumn>[] = [
            { name: "Add Card", onClick: this.onAddCard },
            { name: "Rename Column", onClick: async () => void (0) },
            { name: "Delete Card", onClick: async c => this.setState({ deleteColumn: c }) }
        ]
        return items;
    }

    cardContextMenuItems = () => {
        const items: IContextMenuItem<ICard>[] = [
            { name: "Edit Card", onClick: async c => this.setState({ addEditCard: c }) },
            { name: "Archive Card", onClick: this.onArchiveCardClick },
            { name: "Delete Card", onClick: async c => this.setState({ deleteCard: c }) }
        ]
        return items;
    }

    render() {
        const board = this.props.content as IBoard;
        const columns = [...board.columns ?? []];
        const cards = [...board.cards ?? []];
        const getNextColumnId = () => (max(columns.map(w => w.id)) ?? 0) + 1;
        return <div className="kanban-editor">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        <button>
                            <i className="fas fa-plus" onClick={() => this.setState({ isAddColumnModalVisible: true })}></i>
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
                    <input value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} className="form-control" placeholder="Search..." />
                </div>
                <div className="col-sm-4">
                    <label>Show Archived Cards: </label>
                    <input checked={this.state.showArchivedCards} onChange={e => this.setState({ showArchivedCards: e.target.checked })} className="form-control" type="checkbox" />
                </div>
            </div>
            <div className="column-container">
                <SortContainer
                    itemUI={(e, i) => <Column
                        searchText={this.state.searchText}
                        archivedCardsVisible={this.state.showArchivedCards}
                        cards={cards}
                        column={e}
                        key={`column-${i}`}
                        index={i}
                        onChange={this.onCardsChange}
                        columnContextMenuItems={this.columnContextMenuItems()}
                        cardContextMenuItems={this.cardContextMenuItems()}
                    />}
                    data={columns}
                    onChange={this.onDragChange}
                />
            </div>
            {this.state.deleteCard != null && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleDeleteCard}
                title="Delete Card?"
            >
                <p>Are you sure you want to delete the card {this.state.deleteCard.name}?</p>
            </Modal>}
            {this.state.deleteColumn != null && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleDeleteColumn}
                title="Delete Column?"
            >
                <p>Are you sure you want to delete the column {this.state.deleteColumn.name}?</p>
            </Modal>}
            {this.state.isAddColumnModalVisible && <AddEditColumnModal
                getNextId={getNextColumnId}
                onClose={() => this.setState({ isAddColumnModalVisible: false })}
                onSuccess={this.onAddColumn}
            />}
            {this.state.addEditCard && <AddEditCardModal
                card={this.state.addEditCard}
                onClose={() => this.setState({ addEditCard: null })}
                onSuccess={this.onAddCardSuccess}
            />}
        </div>
    }
}

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


export class KanbanEditorContainer implements IEditor {

    stringifySearchContent = (content: IBoard) => {
        const board = content as IBoard;

        return board.cards.map(w => `${w.name} ${w.content}`).join(" ");
    };


    render = (props: EditorProps) => <KanbanEditor {...props} />;
    renderToolbar = (props: EditorProps) => <KanbanEditorHeader {...props} />;
    getDefaultContent = () => {
        return {
            cards: [],
            columns: []
        } as IBoard;
    };

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPage) => {
        return JSON.stringify(page.content);
    }

    type = PageType.Kanban;
    icon = "bi bi-kanban";
    displayName = "Kanban";
}