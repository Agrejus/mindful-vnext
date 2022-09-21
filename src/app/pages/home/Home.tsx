import React, { useEffect, useRef, useState } from 'react';
import { Portal } from '../../shared-components/modal/Portal';
import { Pane } from '../../shared-components/panes/Pane';
import { SplitPane } from '../../shared-components/panes/SplitPane';
import { SplitterPaneProps } from '@progress/kendo-react-layout';
import { Sections } from './sub-components/pane-content/Sections';
import { Pages } from './sub-components/pane-content/Pages';
import { Content } from './sub-components/pane-content/Content';
import { SubHeader, ToolType } from './sub-components/SubHeader';
import { Search } from './sub-components/Search';
import './Home.scss';
import '../../../../node_modules/@progress/kendo-theme-default/dist/all.scss';
import { IPage, PageType } from '../../data-access/entities/Page';
import { useMindfulDataContext } from '../../providers/MindfulDataContextProvider';
import { ISection, IWidget } from '../../data-access/entities/Section';
import moment from 'moment';
import { sort } from 'radash'
import { SortableOnDragOverEvent } from '@progress/kendo-react-sortable';
import { CSharpToTypescript } from '../../shared-components/tools/c-sharp-to-typescript/CSharpToTypescript';
import { JsonPrettyPrint } from '../../shared-components/tools/json-pretty-print/JsonPrettyPrint';
import { DataSource } from '../../../utilities/DataSource';
import { getDefaultContent, render, stringify } from '../../shared-components/editors';
import { TreeNode } from 'react-draggable-tree';
import { debounce, throttle } from 'radash'
import { MindfulDataContextFactory } from '../../data-access/MindfulDataContext';

interface IHomeProps {

}

export const updateSectionsDebounced = debounce({ delay: 750 }, throttle({ interval: 750 }, async (dbContextFactory: MindfulDataContextFactory, sections: ISection[], done: () => void) => {
    console.log('updateSectionsDebounced')
    const context = dbContextFactory();

    const s = performance.now()
    const linked = await context.sections.link(...sections);
    await context.sections.markDirty(...linked);
    //await context.sections.upsert(...sections);
    await context.saveChanges();
    const e = performance.now();
    console.log('updateSectionsDebounced', e - s);
    done();
}));

const updatePagesDebounced = debounce({ delay: 1500 }, throttle({ interval: 1500 }, async (dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => {
    const context = dbContextFactory();

    const s = performance.now()
    const linked = await context.pages.link(...pages);
    await context.pages.markDirty(...linked);
    await context.saveChanges();
    const e = performance.now();
    console.log('updatePagesDebounced', e - s)
    done();
}))

const createRoot = (dictionary: DataSource<IPage>): TreeNode => {

    const childPageIds = !dictionary.length ? [] : dictionary.map(w => w.children).reduce((a, b) => a.concat(b))
    const rootPageIds = dictionary.map(w => w._id).filter(w => childPageIds.includes(w) === false);

    return {
        children: rootPageIds && rootPageIds.map(w => {
            const page = dictionary.get(w);
            return toTreeNode(page, dictionary);
        }),
        key: -1,
        collapsed: true
    }
}

const toTreeNode = (item: IPage, dictionary: DataSource<IPage>): TreeNode => {
    return {
        children: item.children.length > 0 ? item.children.map(w => {
            const page = dictionary.get(w);
            return toTreeNode(page, dictionary);
        }) : [],
        key: item._id,
        collapsed: item.isCollapsed,
        order: item.order
    } as TreeNode;
}




export const Home: React.FunctionComponent<IHomeProps> = (props) => {

    const [activeTool, setActiveTool] = useState<ToolType | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [showArchivedSections, setShowArchivedSections] = useState<boolean>(false);
    const [sections, setSections] = useState<ISection[]>([]);
    const [pages, setPages] = useState<DataSource<IPage>>(DataSource.fromArray<IPage>("_id", []));
    const [selectedPage, setSelectedPage] = useState<IPage | undefined>(undefined);
    const [selectedSection, setSelectedSection] = useState<ISection | undefined>(undefined);
    const dbContextFactory = useMindfulDataContext();

    const panes: SplitterPaneProps[] = [
        { size: '220px', min: '125px', collapsible: true },
        { size: '250px', min: '150px', collapsible: true },
        { min: '100px', collapsible: true }
    ];

    useEffect(() => {

        const setup = async () => {
            const context = dbContextFactory();
            const allSections = await context.sections.all();
            const section = allSections.find(w => w.isSelected === true);

            setSections(sort(allSections, w => w.order, false));

            if (section) {

                setSelectedSection(section);
                const allPages = await context.pages.filter(w => w.sectionId === section._id);
                setPages(DataSource.fromArray("_id", allPages));

                const page = allPages.find(w => w.isSelected === true);

                if (page) {
                    setSelectedPage({ ...page });
                }
            }
        }

        setup();

    }, [])

    const renderVisibleTool = () => {

        if (activeTool === "CSharpToTypescript") {
            return <CSharpToTypescript onClose={() => setActiveTool(null)} />
        }

        if (activeTool === "JsonPrettyPrint") {
            return <JsonPrettyPrint onClose={() => setActiveTool(null)} />
        }
        return null
    }

    const onSectionsChangeAll = async (changes: ISection[]) => {

        const cloned = [...changes]

        setSections(cloned)

        updateSectionsDebounced(dbContextFactory, cloned, () => { })
    }

    const onSectionChange = async (change: ISection) => {

        const index = sections.findIndex(w => w._id === change._id);
        const clonedSections = [...sections]
        const clonedChange = { ...change }

        if (index !== -1) {
            clonedSections[index] = clonedChange
        }

        setSections(clonedSections);

        if (selectedSection?._id === change._id) {
            setSelectedSection(clonedChange)
        }

        updateSectionsDebounced(dbContextFactory, [clonedChange], () => { })
    }

    const onSectionDelete = async (id: string) => {

        const context = dbContextFactory();

        const allPages = await context.pages.filter(w => w.sectionId === id);
        await context.sections.remove(id);
        await context.pages.remove(...allPages);

        await context.saveChanges();

        const allSections = await context.sections.all();

        if (selectedSection?._id === id) {
            setSelectedSection(undefined);
            setPages(DataSource.fromArray<IPage>("_id", []));
            setSelectedPage(undefined);
        }

        setSections(allSections)
    }

    const onSectionCreate = async (name: string) => {
        const context = dbContextFactory();
        const clonedSections = [...sections]
        for (let item of clonedSections) {
            item.isSelected = false;
        }

        const [newSection] = await context.sections.add({
            sectionName: name,
            isDisabled: false,
            color: "green",
            order: -1,
            createDateTime: moment().format(),
            isSelected: true,
            widgets: [],
            isArchived: false,
            settings: {},
            selectedKeys: [],
            treeRoot: null
        });

        const linkedData = await context.sections.link(...clonedSections);
        await context.sections.markDirty(...linkedData);

        await context.saveChanges();

        setPages(DataSource.fromArray<IPage>("_id", []))
        setSelectedPage(undefined);
        setSelectedSection(newSection);
        setSections(sort([...clonedSections, newSection], w => w.order, false))
    }

    const onSectionSelect = async (id: string) => {
        const clonedSections = [...sections];
        let index = -1;
        clonedSections.forEach((w, i) => {
            if (w._id === id) {
                w.isSelected = true
                index = i
                return;
            }

            w.isSelected = false
        });

        setSections(clonedSections);
        updateSectionsDebounced(dbContextFactory, clonedSections, () => { });

        if (index != -1) {

            setSelectedSection({ ...clonedSections[index] })

            const context = dbContextFactory();
            const sectionPages = await context.pages.filter(w => w.sectionId === id);
            const selectedPage = sectionPages.find(w => w.isSelected === true);

            if (selectedPage != null) {
                setSelectedPage({ ...selectedPage })
            }

            setPages(DataSource.fromArray("_id", sectionPages))
        }
    }



    const onPageChange = async (dataSource: DataSource<IPage>) => {

        const p = dataSource.shallow();

        if (selectedPage != null) {
            const selected = dataSource.get(selectedPage._id)

            if (p.set(selected)) {
                setSelectedPage(selected)

                updatePagesDebounced(dbContextFactory, [selected], () => { })
            }
        }

        setPages(p)
    }

    const onPageCreate = async (name: string, type: PageType) => {

        if (selectedSection == null) {
            return;
        }

        const context = dbContextFactory();
        const [linkedSection] = await context.sections.link(selectedSection)
        const [page] = await context.pages.add({
            sectionId: linkedSection._id,
            pageName: name,
            isPinned: false,
            content: getDefaultContent(type),
            createDateTime: moment().format(),
            order: 0,
            pageTypeId: type,
            isSelected: false,
            children: [],
            isCollapsed: true,
            pageGroupId: -1,
            isContextMenuVisible: false
        });

        const dataSource = pages.shallow();
        dataSource.push(page)
        linkedSection.treeRoot = createRoot(dataSource);
        await context.saveChanges();
        const final = await context.pages.all()

        setPages(DataSource.fromArray("_id", final))
    }

    const onPageDelete = async (page: IPage) => {

        const context = dbContextFactory();
        await context.pages.remove(page._id);

        if (selectedSection != null) {
            const [linkedSection] = await context.sections.link({ ...selectedSection })
            if (linkedSection.selectedKeys.includes(page._id)) {
                linkedSection.selectedKeys = linkedSection.selectedKeys.filter(w => w !== page._id);
            }
        }

        const parent = pages.find(w => w.children.includes(page._id))

        if (parent) {
            const [linkedParent] = await context.pages.link(parent);
            linkedParent.children = linkedParent.children.filter(w => w !== page._id)
        }

        await context.saveChanges();
        
        const allPages = await context.pages.all();
        const sections = await context.sections.all();
        const dataSource = DataSource.fromArray<IPage>("_id", [...allPages]);
        const foundSection = sections.find(w => w._id === page.sectionId)

        setSelectedPage(undefined);
        setPages(dataSource);
        setSections([...sections]);
        
        if (foundSection) {

            foundSection.treeRoot = createRoot(dataSource);

            await context.saveChanges();

            if (foundSection._id === selectedSection?._id) {
                setSelectedSection({ ...foundSection });
            }
        }
    }

    const onPageSelect = async (id: string) => {

        if (selectedSection == null) {
            return;
        }

        const changedPages = pages.all();
        const selectedKeys: string[] = [];
        const clonedSection = { ...selectedSection };

        for (let page of changedPages) {
            if (page._id === id) {
                selectedKeys.push(id);
                page.isSelected = true;
                setSelectedPage(page)
                continue;
            }

            page.isSelected = false;
        }

        selectedSection.selectedKeys = selectedKeys;

        setSelectedSection(clonedSection);
        setPages(DataSource.fromArray("_id", changedPages))

        updatePagesDebounced(dbContextFactory, changedPages, () => { });
    }


    const onContentChange = async (content: any) => {

        if (selectedPage == null || selectedSection == null) {
            return;
        }

        const page = { ...selectedPage }
        page.content = content;

        // // move to worker?
        // if (section.widgets && section.widgets.length > 0) {

        //     for (let i = 0; i < section.widgets.length; i++) {
        //         const widget = section.widgets[i];
        //         onChange(widget, this.state.pages);
        //     }

        //     this.updateSectionDebounced(section);

        //     newState.selectedSection = { ...section };

        //     const sections = this.state.sections;
        //     const index = this.state.sections.findIndex(w => w._id === section._id);

        //     sections[index].widgets = section.widgets;
        //     newState = {
        //         ...newState,
        //         selectedSection: { ...section },
        //         sections: [...sections]
        //     };
        // }

        setSelectedPage(page)

        updatePagesDebounced(dbContextFactory, [page], () => { })
    }

    return <React.Fragment>
        <div id="full-modal-portal"></div>
        <SubHeader
            onNavigateToTool={w => setActiveTool(w)}
            onToggleArchivedSections={() => setShowArchivedSections(w => !w)}
            searchText={searchText}
            onSearchTextChanged={setSearchText}
        />
        <div className="page-container" id="home-page-container">
            <Search searchText={searchText} />
            <SplitPane panes={panes} orientation="horizontal">
                <Pane className="sections-content-pane">
                    <Sections
                        onChangeAll={onSectionsChangeAll}
                        onChange={onSectionChange}
                        onDelete={onSectionDelete}
                        onCreate={onSectionCreate}
                        onSelect={onSectionSelect}
                        sections={sections}
                    />
                </Pane>
                <Pane className="pages-content-pane">
                    {selectedSection && <Pages
                        onChange={onPageChange}
                        onCreate={onPageCreate}
                        onDelete={onPageDelete}
                        onSectionChange={onSectionChange}
                        onSelect={onPageSelect}
                        pages={pages}
                        section={selectedSection}
                    />}
                </Pane>
                <Pane>
                    {selectedPage && selectedSection && <Content
                        onChange={onContentChange}
                        page={selectedPage}
                        section={selectedSection}
                    />}
                </Pane>
            </SplitPane>
            {/* {this.state.changeColorSection && <ChangeSectionColorModal
                onClick={this.onChangeSectionColorHandler}
                onColorChange={this.onColorChange}
                color={this.state.changeColorSection.color}
            />}
            {this.state.selectedReminder && <ReminderModal
                reminder={this.state.selectedReminder}
                onClick={this.reminderHandler}
                onChange={e => this.setState({ selectedReminder: e })}
            />} */}
            <Portal id="full-modal-portal">
                {renderVisibleTool()}
            </Portal>
        </div>
    </React.Fragment>
}