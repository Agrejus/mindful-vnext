import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { DataSource } from '../../../utilities/DataSource';
import { IPage, PageType } from '../../data-access/entities/Page';
import { ISection } from '../../data-access/entities/Section';
import { useMindfulDataContext } from '../../providers/MindfulDataContextProvider';
import { getDefaultContent } from '../../shared-components/editors';
import { Home } from './Home';
import { queuePageChange } from '../../../utilities/PageUpdater';

interface IPageContainerProps {
    sections: ISection[]
    selectedSection: ISection | undefined;
    onSectionChanges: (sections: ISection[]) => Promise<void>;
    onSectionChange: (section: ISection) => Promise<void>;
    onSectionDelete: (id: string) => Promise<ISection | undefined>;
    onSectionCreate: (name: string) => Promise<void>;
    onSectionSelect: (id: string) => Promise<void>;
}

export type DirtyPages = { [key:string]: true }

export const PageContainer: React.FC<IPageContainerProps> = (props) => {

    const { children, sections, selectedSection, onSectionChange, onSectionChanges, onSectionSelect } = props;
    const [pages, setPages] = useState<DataSource<IPage>>(DataSource.fromArray<IPage>("_id", []));
    const [selectedPage, setSelectedPage] = useState<IPage | undefined>(undefined);
    const [dirtyPages, setDirtyPages] = useState<DirtyPages>({})

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
                } else {
                    setSelectedPage(undefined);
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

        // if (selectedPage != null) {
        //     const selected = dataSource.get(selectedPage._id)

        //     if (p.set(selected)) {
        //         setSelectedPage(selected)
        //     }
        // }
        queuePageChange('onPageChange', dbContextFactory, p.all(), () => { })

        setPages(p)
    }


    const onPageCreate = async (name: string, type: PageType) => {

        if (selectedSection == null) {
            return;
        }

        const context = dbContextFactory();
        const [page] = await context.pages.add({
            sectionId: selectedSection._id,
            pageName: name,
            title: "",
            isPinned: false,
            content: getDefaultContent(type),
            createDateTime: moment().format(),
            order: 0,
            pageType: type,
            isSelected: false,
            path: [],
            children: [],
            expanded: false,
            isContextMenuVisible: false
        });

        page.path = [page._id]

        const dataSource = pages.shallow();
        dataSource.push(page)
        await context.saveChanges();
        const final = await context.pages.all()

        setPages(DataSource.fromArray("_id", final))
    }

    const onPageDelete = async (page: IPage) => {

        // needs some love
        const context = dbContextFactory();
        await context.pages.remove(page._id);

        const parent = pages.find(w => w.children.some(x => x.id === page._id))

        if (parent) {
            const [linkedParent] = await context.pages.link(parent);
            linkedParent.children = linkedParent.children.filter(w => w.id !== page._id)
        }

        await context.saveChanges();

        const allPages = await context.pages.all();
        const dataSource = DataSource.fromArray<IPage>("_id", [...allPages]);

        setSelectedPage(undefined);
        setPages(dataSource);
    }

    const onPageSelect = async (id: string) => {

        if (selectedSection == null) {
            return;
        }

        const changedPages = pages.shallow().all();
        const changes: IPage[] = []

        for (let page of changedPages) {
            if (page._id === id) {
                page.isSelected = true;
                setSelectedPage(page);
                changes.push(page)
                continue;
            }

            if (page._id !== id && page.isSelected === true) {
                page.isSelected = false;
                changes.push(page)
            }
        }

        setPages(DataSource.fromArray("_id", changedPages))

        queuePageChange('onPageSelect', dbContextFactory, changes, () => { });
    }


    const onContentChange = async (content: any) => {

        if (selectedPage == null || selectedSection == null) {
            return;
        }

        const p = pages.shallow();
        const page = { ...selectedPage }
        page.content = content;
        p.set(page);

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

        queuePageChange('onContentChange', dbContextFactory, [page], () => {
            onTogglePageDirty(page._id, false)
        })

        setSelectedPage(page);
        setPages(p);
        onTogglePageDirty(page._id, true);
    }

    const onTogglePageDirty = (id: string, isDirty: boolean) => {

        if (isDirty === false) {
            setDirtyPages(w => {
                const clone = {...w}
                delete clone[id];
                return clone;
            });
            return;
        }

        setDirtyPages(w => {
            const clone = {...w}
            clone[id] = true;
            return clone;
        });
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
        dirtyPages={dirtyPages}
        onTogglePageDirty={onTogglePageDirty}
    >{children}</Home>
}