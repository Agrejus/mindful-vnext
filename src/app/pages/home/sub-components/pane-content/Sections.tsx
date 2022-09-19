import React, { useState } from 'react';
import { Sortable, SortableOnDragOverEvent, SortableOnDragStartEvent } from '@progress/kendo-react-sortable';
import { Portal } from '../../../../shared-components/modal/Portal';
import { ISection } from '../../../../data-access/entities/Section';
import { CreatableNavButton } from '../../../../shared-components/buttons/CreatableNavButton';
import { ButtonType, Modal } from '../../../../shared-components/modal/Modal';
import { RenameModal } from '../../../../shared-components/modal/RenameModal';
import { ChangeSectionColorModal } from '../../../../shared-components/modal/ChangeSectionColorModal';
import { SectionListItem } from './sub-components/SectionListItem';
import { ContextMenuOptions } from './sub-components/SectionButton';
import { useDispatch, useSelector } from 'react-redux';
import * as sectionActions from '../../../../redux/actions/SectionActions';
import * as sectionReducer from '../../../../redux/reducers/SectionReducer';

interface ISectionsProps {

}

export const Sections: React.FunctionComponent<ISectionsProps> = (props) => {

    const [isCreatingNewSection, setIsCreatingNewSection] = useState<boolean>(false);
    const [deleteSection, setDeleteSection] = useState<ISection | null>(null);
    const [renameSection, setRenameSection] = useState<ISection | null>(null);
    const [changeColorSection, setChangeColorSection] = useState<ISection | null>(null);
    const [settingsSection, setSettingsSection] = useState<ISection | null>(null);

    const dispatch = useDispatch();

    const onCreate = (name: string) => dispatch(sectionActions.create(name));
    const onDelete = (id: string) => dispatch(sectionActions.deleteSection(id));
    const onChangeSections = (sections: ISection[]) => dispatch(sectionReducer.changes(sections));
    const onSelect = (id: string) => dispatch(sectionActions.selectSection(id));
    const onChange = (section: ISection) => dispatch(sectionActions.changeSection(section));

    const sections = useSelector(sectionReducer.getSections);

    const onCreateSection = async (name: string) => {
        onCreate(name);
        setIsCreatingNewSection(false);
    }

    const onSectionDragOver = (event: SortableOnDragOverEvent) => {
        console.log('onSectionDragOver')
        const sections = event.newState as ISection[];

        for (let i = 0; i < sections.length; i++) {
            sections[i].order = i + 1;
        }

        onChangeSections(sections);
    }

    const handleDeleteSection = async (type: ButtonType, id: string) => {

        if (type === 'Yes') {
            onDelete(id);
        }

        setDeleteSection(null);
    }

    const handleColorChange = async (section: ISection) => {
        onChange(section);
        setChangeColorSection(null);
    }

    const handleRenameSection = async (name: string) => {

        if (renameSection == null) {
            return;
        }

        onChange({ ...renameSection, sectionName: name });
        setRenameSection(null);
    }

    const onDragStart = (e: SortableOnDragStartEvent) => {
        if (e.element.classList.contains('bi') && e.element.tagName === "I") {
            e.preventDefault();
        }
    }

    const onArchiveClick = async (section: ISection) => {
        section.isArchived = true;
        onChange(section);
    }

    const onContextMenuItemClick = async (option: ContextMenuOptions, section: ISection) => {
        const functions: { [key in ContextMenuOptions]: (section: ISection) => Promise<void> | void } = {
            [ContextMenuOptions.Archive]: onArchiveClick,
            [ContextMenuOptions.ChangeColor]: setChangeColorSection,
            [ContextMenuOptions.Delete]: setDeleteSection,
            [ContextMenuOptions.Rename]: setRenameSection,
            [ContextMenuOptions.Settings]: setSettingsSection,
            [ContextMenuOptions.Widgets]: setSettingsSection
        }

        const operation = functions[option];

        await operation(section);
    }

    return <>
        {isCreatingNewSection === true && <CreatableNavButton key={"new-section"} defaultText="New Section" color="green" onSave={onCreateSection} />}
        {sections.length > 0 && <Sortable
            idField={'_id'}
            disabledField={'isDisabled'}
            data={sections}
            onDragStart={onDragStart}
            itemUI={e => <SectionListItem
                {...e}
                onSelect={id => onSelect(id)}
                onContextMenuOptionClick={option => onContextMenuItemClick(option, e.dataItem)}
            />}
            onDragOver={onSectionDragOver}
        />}
        <button className="nav-button nav-button-add" onClick={() => setIsCreatingNewSection(true)}><i className="bi bi-plus icon-md"></i>&nbsp;Add Section</button>
        {deleteSection != null && <Modal
            buttons={["Yes", "Cancel"]}
            onClick={type => handleDeleteSection(type, deleteSection._id)}
            title="Delete Section?"
        >
            <p>Are you sure you wish to delete {deleteSection.sectionName} and its pages?</p>
        </Modal>}

        {renameSection && <RenameModal
            initialValue={renameSection.sectionName}
            inputHeader="Section Name"
            title='Rename Section'
            onSave={handleRenameSection}
            onClose={() => setRenameSection(null)}
        />}
        {changeColorSection && <ChangeSectionColorModal
            onSuccess={handleColorChange}
            onCancel={() => setChangeColorSection(null)}
            section={changeColorSection}
        />}
        {/* {this.state.widgetSection != null && <AddWidgetModal
            widgets={this.state.widgetSection.widgets}
            titlePrefix="Sections"
            onChange={e => this.props.onSectionWidgetsChange(this.state.widgetSection!, e)}
            onClose={() => this.setState({ widgetSection: null })}
        />}
         */}

        <Portal id="full-modal-portal">
            {settingsSection && <>
                <i className="bi bi-x-circle clickable" onClick={() => setSettingsSection(null)}></i>
                <h1>{settingsSection.sectionName} Settings</h1>
                <hr />
                <div className="row">
                    <div className="col-sm-12">
                        <label className="full-width">Section Name: </label>
                        <input type="text" className="form-control" value={settingsSection.sectionName} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <label className="full-width">Color: </label>
                        <div style={{ width: "50px", display: "inline-block", borderRadius: "8px", backgroundColor: settingsSection.color }}>&emsp;</div>&emsp;
                        <button className="btn btn-secondary">Change Color</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <label className="full-width">Widgets: </label>
                        <input type="text" className="form-control" value={settingsSection.color} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <button className="btn btn-success" onClick={() => void (0)}>Save</button>
                    </div>
                </div>
            </>}
        </Portal>

    </>
}