import React, { useState } from 'react';
import './NotepadEditor.scss';
import { ButtonType, Modal } from '../../modal/Modal';
import { EditorProps, IEditor } from '..';
import { IPage, PageType } from '../../../data-access/entities/Page';
import SortableList from "react-easy-sort";
import { arrayMoveImmutable } from "array-move";
import { SortableTab } from './sub-components/SortableTab';
import { RenameModal } from '../../modal/RenameModal';
import { EditorHeader } from '../../header/EditorHeader';
import { JoditRichTextEditorWrapper } from '../jodit-rich-text-editor/JoditRichTextEditor';
import { sort } from 'radash';

export interface INote {
    isSelected: boolean;
    order: number;
    content: string;
    title: string;
    id: number;
}

type Notes = { [key: number]: INote };

const NotepadEditor: React.FunctionComponent<EditorProps> = (props) => {

    const { content } = props;
    const notes = content as Notes;
    const [deleteNote, setDeleteNote] = useState<INote | null>(null);
    const [renameNote, setRenameNote] = useState<INote | null>(null);

    const onChange = (notes: Notes) => {
        props.onChange(notes);
    }

    const onSelect = (id: number) => {

        for(let key in notes) {
            notes[key].isSelected = notes[key].id === id;
        }
        onChange(notes);
    }

    const handleContentChange = (content: string, id: number) => {
        notes[id].content = content;
        onChange(notes);
    }

    const onTitleChange = (title: string, id: number) => {
        notes[id].title = title;
        onChange(notes);
    }

    const addNote = () => {

        for(let key in notes) {
            notes[key].isSelected = false;
        }

        const id = Object.keys(notes).length + 1;
        notes[id] = {
            content: "",
            isSelected: true,
            order: 1,
            title: `new ${id}`,
            id: id
        }

        onChange(notes);
    }

    const handleDeleteNote = (button: ButtonType) => {

        if (button != "Yes" || deleteNote == null) {
            setDeleteNote(null)
            return;
        }

        delete notes[deleteNote.id];

        onChange(notes);

        setDeleteNote(null)
    }

    const onSortEnd = (oldIndex: number, newIndex: number) => {
        const notesArray = sort(Object.values(notes), w => w.order, false)
        const sortedNotes = arrayMoveImmutable(notesArray, oldIndex, newIndex).reduce((a, v, i) => ({ ...a, [v.id]: {...v, order: i} }), {} as Notes)
        onChange(sortedNotes);
    };

    const notesArray = sort(Object.values(notes), w => w.order, false)
    const selectedIndex = notesArray.findIndex(w => w.isSelected === true);
    const selected = selectedIndex != -1 ? notesArray[selectedIndex] : null;

    return <div className="notepad-editor">
        <EditorHeader
            quickAccessUI={() => <div>
                <button onClick={addNote}>
                    <i className="fas fa-plus"></i>
                </button>
            </div>}
        />
        {notesArray.length > 0 && <SortableList
            onSortEnd={onSortEnd}
            className="sortable-list"
            draggedItemClassName="sortable-item-dragging"
        >
            {notesArray.map((w, i) => <SortableTab
                note={w}
                key={w.id}
                onDelete={() => setDeleteNote(w)}
                isSelected={w.isSelected}
                onSelect={() => onSelect(w.id)}
                onRenameClick={() => setRenameNote(w)}
            />)}
        </SortableList>}
        <div className="rich-text-content">
            {selected != null && <JoditRichTextEditorWrapper
                key={selected.id}
                content={selected.content}
                onChange={e => handleContentChange(e, selected.id)}
                showToolbar={false}
            />}
        </div>
        {deleteNote && <Modal<INote, any>
            buttons={["Yes", "Cancel"]}
            onClick={handleDeleteNote}
            title="Delete Tab?"
        >
            <p>Are you sure you wish to delete {deleteNote.title}?</p>
        </Modal>}
        {renameNote && <RenameModal
            initialValue={renameNote.title}
            inputHeader="Tab Name"
            title='Rename Tab'
            onClose={() => setRenameNote(null)}
            onSave={e => onTitleChange(e, renameNote.id)}
        />}
    </div>
}

export class NotepadContainer implements IEditor {

    stringifySearchContent = (content: any) => "";

    render = (props: EditorProps) => <NotepadEditor {...props} />;
    renderToolbar = (props: EditorProps) => <div>Toolbar</div>;
    getDefaultContent = () => [];

    parse = (page: IPage) => JSON.parse(page.content);

    stringify = (page: IPage) => JSON.stringify(page.content);

    type = PageType.Notepad;
    icon = "far fa-sticky-note";
    displayName = "Notepad";
}