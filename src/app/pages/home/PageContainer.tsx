import moment from 'moment';
import { debounce, throttle } from 'radash';
import React, { useEffect, useState } from 'react';
import { TreeNode } from 'react-draggable-tree';
import { DataSource } from '../../../utilities/DataSource';
import { IPage, PageType } from '../../data-access/entities/Page';
import { ISection } from '../../data-access/entities/Section';
import { MindfulDataContextFactory } from '../../data-access/MindfulDataContext';
import { useMindfulDataContext } from '../../providers/MindfulDataContextProvider';
import { getDefaultContent } from '../../shared-components/editors';
import { Home } from './Home';
import { updateSectionsDebounced } from './SectionContainer';

interface IPageContainerProps {
    sections: ISection[]
    selectedSection: ISection | undefined;
    onSectionChanges: (sections: ISection[]) => Promise<void>;
    onSectionChange: (section: ISection) => Promise<void>;
    onSectionDelete: (id: string) => Promise<ISection | undefined>;
    onSectionCreate: (name: string) => Promise<void>;
    onSectionSelect: (id: string) => Promise<void>;

    onSetSelectedSection: (section: ISection | undefined) => void;
    onSetSections: (sections: ISection[]) => void;
}

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


export const PageContainer: React.FC<IPageContainerProps> = (props) => {

    const { children, sections, selectedSection, onSectionChange, onSectionChanges, onSetSelectedSection, onSetSections, onSectionSelect } = props;
    const [pages, setPages] = useState<DataSource<IPage>>(DataSource.fromArray<IPage>("_id", []));
    const [selectedPage, setSelectedPage] = useState<IPage | undefined>(undefined);

    const dbContextFactory = useMindfulDataContext();

    useEffect(() => {

        const setup = async () => {
            if (selectedSection != null) {
                const context = dbContextFactory();
                const allPages = await context.pages.filter(w => w.sectionId === selectedSection._id);
                setPages(DataSource.fromArray("_id", allPages));
    
                const page = allPages.find(w => w.isSelected === true);
    
                if (page) {
                    setSelectedPage({ ...page });
                }
            }
        }

        setup();

    }, [selectedSection?._id])

    const onSectionDelete = async (id: string) => {
        const section = await props.onSectionDelete(id);

        if (section != null) {
            setPages(DataSource.fromArray<IPage>("_id", []));
            setSelectedPage(undefined);
        }
    }

    const onSectionCreate = async (name: string) => {
        await props.onSectionCreate(name);
        setPages(DataSource.fromArray<IPage>("_id", []))
        setSelectedPage(undefined);
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
        onSetSections([...sections]);

        if (foundSection) {

            foundSection.treeRoot = createRoot(dataSource);

            await context.saveChanges();

            if (foundSection._id === selectedSection?._id) {
                onSetSelectedSection({ ...foundSection });
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

        clonedSection.selectedKeys = selectedKeys;

        onSetSelectedSection(clonedSection);
        setPages(DataSource.fromArray("_id", changedPages))

        updatePagesDebounced(dbContextFactory, changedPages, () => { });
        updateSectionsDebounced(dbContextFactory, [clonedSection], () => { })
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

    return <Home
        sections={sections}
        selectedSection={selectedSection}
        onSectionSelect={onSectionSelect}
        onSectionDelete={onSectionDelete}
        onSectionCreate={onSectionCreate}
        onSectionChange={onSectionChange}
        onSectionChanges={onSectionChanges}

        onContentChange={onContentChange}
        onPageChange={onPageChange}
        onPageCreate={onPageCreate}
        onPageDelete={onPageDelete}
        onPageSelect={onPageSelect}
        pages={pages}
        selectedPage={selectedPage}
    >{children}</Home>
}