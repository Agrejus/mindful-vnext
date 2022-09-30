import React, { useRef, useState } from 'react';
import './NotepadEditor.scss';
import { convertFromRaw, convertToRaw, Editor, EditorState, Modifier, RichUtils } from 'draft-js';
import { ButtonType, Modal } from '../../modal/Modal';
import { EditorProps, IEditor } from '..';
import { IPage, PageType } from '../../../data-access/entities/Page';
import SortableList from "react-easy-sort";
import { arrayMoveImmutable } from "array-move";
import { SortableTab } from './sub-components/SortableTab';
import { RenameModal } from '../../modal/RenameModal';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface INote {
    isSelected: boolean;
    order: number;
    content: any;
    title: string;
    id: number;
}

const NotepadEditor: React.FunctionComponent<EditorProps> = (props) => {

    const { content, onChange } = props;
    const notes = content as INote[];
    const [deleteNote, setDeleteNote] = useState<INote | null>(null);
    const [renameNote, setRenameNote] = useState<INote | null>(null);
    const editors = useRef<{ [key: string]: Editor | null }>({});

    const onSelect = (id: number) => {
        const alteredNotes = notes.map(w => ({ ...w, isSelected: w.id === id }));
        onChange(alteredNotes);
    }

    const onTab = (e: React.KeyboardEvent<{}>, index: number) => {
        e.preventDefault();

        if (e.shiftKey) {
            // figure out how to get this to work
            const currentState = notes[index].content;
            handleContentChange(RichUtils.onTab(e, currentState, 4), index);
        } else {
            const currentState = notes[index].content;
            const newContentState = Modifier.replaceText(
                currentState.getCurrentContent(),
                currentState.getSelection(),
                "    "
            );

            const newState = EditorState.push(currentState, newContentState, 'insert-characters');
            handleContentChange(newState, index);
        }
    }

    const handleContentChange = (e: EditorState, index: number) => {
        notes[index].content = e;
        onChange(notes);
    }

    const onTitleChange = (title: string, id: number) => {
        const index = notes.findIndex(w => w.id === id)
        notes[index].title = title;
        onChange(notes);
    }

    const addNote = () => {
        const alteredNotes = notes.map((w, i) => {
            return { ...w, isSelected: false }
        });
        alteredNotes.push({
            content: EditorState.createEmpty(),
            isSelected: true,
            order: 1,
            title: `new ${alteredNotes.length + 1}`,
            id: notes.length + 1
        });
        onChange(alteredNotes);
    }

    const handleDeleteNote = (button: ButtonType) => {

        if (button != "Yes" || deleteNote == null) {
            setDeleteNote(null)
            return;
        }
        const index = notes.findIndex(w => w.id === deleteNote!.id);

        if (index === -1) {
            setDeleteNote(null)
            return;
        }

        notes.splice(index, 1);

        onChange(notes);

        setDeleteNote(null)
    }

    const onSortEnd = (oldIndex: number, newIndex: number) => {
        const sortedNotes = arrayMoveImmutable(notes, oldIndex, newIndex)
        onChange(sortedNotes);
    };

    const focusEditor = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {

        if (e.target instanceof HTMLImageElement) {

        }

        if (editors.current[index]) {
            editors.current[index]!.focus();
        }
    }

    const selectedIndex = notes.findIndex(w => w.isSelected === true);
    const selected = selectedIndex != -1 ? notes[selectedIndex] : null;

    return <div className="notepad-editor">
        {/* <div className="editor-toolbar">
            <div className="editor-toolbar-row">
                <div className="editor-toolbar-button-group">
                    <button onClick={addNote}>
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div> */}
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <button onClick={addNote}>
                    <i className="fas fa-plus"></i>
                </button>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                </Typography>
            </AccordionDetails>
        </Accordion>

        {notes.length > 0 && <SortableList
            onSortEnd={onSortEnd}
            className="sortable-list"
            draggedItemClassName="sortable-item-dragging"
        >
            {notes.map((w, i) => <SortableTab
                note={w}
                key={w.id}
                onDelete={() => setDeleteNote(w)}
                isSelected={w.isSelected}
                onSelect={() => onSelect(w.id)}
                onRenameClick={() => setRenameNote(w)}
            />)}
        </SortableList>}
        <div className="rich-text-content" onClick={e => focusEditor(e, selectedIndex)}>
            {selected != null && <Editor
                placeholder="Your notes here..."
                ref={e => { editors.current[selectedIndex] = e; }}
                editorState={selected.content}
                onChange={e => handleContentChange(e, selectedIndex)}
                onTab={e => onTab(e, selectedIndex)}
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

    getDefaultContent = () => [];

    parse = (page: IPage) => {
        const notes = JSON.parse(page.content) as any[];
        for (let note of notes) {
            if (!note.content) {
                note.content = EditorState.createEmpty();
            } else {
                try {
                    note.content = EditorState.createWithContent(convertFromRaw(note.content))
                } catch {
                    note.content = EditorState.createEmpty();
                }
            }
        }
        return notes;
    }

    stringify = (page: IPage) => {
        const notes = page.content as any[];
        const stringifiedContentNotes = notes.map(w => {
            return {
                ...w,
                content: convertToRaw(w.content.getCurrentContent())
            }
        })

        return JSON.stringify(stringifiedContentNotes);
    }

    type = PageType.Notepad;
    icon = "far fa-sticky-note";
    displayName = "Notepad";
}