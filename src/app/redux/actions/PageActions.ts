import { AnyAction, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import moment from "moment";
import { debounce, throttle } from "radash";
import { TreeNode, TreeRowInfo } from "react-draggable-tree";
import { DataSource } from "../../../utilities/DataSource";
import { IPage, PageType } from "../../data-access/entities/Page";
import { ISection } from "../../data-access/entities/Section";
import { MindfulDataContextFactory } from "../../data-access/MindfulDataContext";
import { getDefaultContent } from "../../shared-components/editors";
import * as pageReducer from "../reducers/PageReducer";
import * as sectionReducer from "../reducers/SectionReducer";
import { AsyncThunkConfig, RootState, ThunkExtraArgs } from "../store";
import { saveSections } from "./SectionActions";

const debounced: { [key: string]: UpdatePages } = {}

type UpdatePages = (dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => void
export const savePages: UpdatePages = (dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => {
    const key = pages.map(w => w._id).join("_");
    if (debounced[key] == null) {
        debounced[key] = debounce({ delay: 1500 }, throttle({ interval: 1500 }, async (dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => {
            const key = pages.map(w => w._id).join("_");
            delete debounced[key];
            console.log('debounced', debounced)
            const context = dbContextFactory();

            const s = performance.now()
            const linked = await context.pages.link(...pages);
            await context.pages.markDirty(...linked);
            // await context.pages.upsert(...pages);
            await context.saveChanges();
            const e = performance.now();
            console.log('updatePagesDebounced', e - s);
            done();
        }));
    }

    debounced[key](dbContextFactory, pages, done);
}


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

export type CreatePageProps = { name: string, type: PageType }
export const onCreatePage = createAsyncThunk<void, CreatePageProps, AsyncThunkConfig>("setSelectedPage", async (props: CreatePageProps, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { name, type } = props;
    const { sections, pages } = getState();
    const { selected: selectedSection } = sections;
    const { data } = pages;

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
        isContextMenuVisible: false,
        savedDateTime: moment().format()
    });

    const dataSource = data.shallow();
    dataSource.push(page)
    linkedSection.treeRoot = createRoot(dataSource);
    await context.saveChanges();
    const final = await context.pages.all()

    dispatch(pageReducer.setAll(final));
    dispatch(sectionReducer.setSelected({ ...linkedSection }));
});

export const selectPage = createAsyncThunk<void, string, AsyncThunkConfig>("selectPage", async (id: string, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections, pages } = getState();
    const { selected: selectedSection } = sections;
    const { data } = pages;

    if (selectedSection == null) {
        return;
    }

    const clonedSection = { ...selectedSection }

    dispatch(pageReducer.setIsLoading({ isSaving: true, id }))

    const changedPages = data.all().map(w => ({ ...w }));
    const selectedKeys: string[] = []

    for (let page of changedPages) {
        if (page._id === id) {
            selectedKeys.push(id);
            page.isSelected = true;
            dispatch(pageReducer.setSelected(page))
            continue;
        }

        page.isSelected = false;
    }

    clonedSection.selectedKeys = selectedKeys;

    // updatePagesDebounced(dbContextFactory, changedPages, () => {
    //     dispatch(pageReducer.setIsLoading({ isSaving: false, id }))
    // });

    // updateSectionsDebounced(dbContextFactory, [clonedSection], () => { });

    dispatch(pageReducer.setAll(changedPages));
});

export const onContentChange = createAsyncThunk<void, any, AsyncThunkConfig>("onContentChange", async (content: any, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections, pages } = getState();
    const { selected: selectedSection } = sections;
    const { selected: selectedPage } = pages;
    const { data } = pages;

    if (selectedPage == null || selectedSection == null) {
        return;
    }

    dispatch(pageReducer.setIsDirtyId({ isDirty: true, id: selectedPage._id }))

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

    dispatch(pageReducer.setOne(page));
    dispatch(pageReducer.setSelected(page));

    savePages(dbContextFactory, [page], () => {
        dispatch(pageReducer.setIsDirtyId({ isDirty: false, id: selectedPage._id }));
        dispatch(pageReducer.setSavedDate(selectedPage._id))
    })
});

export const onPagesChange = createAsyncThunk<void, IPage[], AsyncThunkConfig>("onPagesChange", async (payload: IPage[], thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { pages } = getState();
    const { selected: selectedPage } = pages;

    const dataSource = DataSource.fromArray("_id", payload);
    const p = dataSource.shallow();

    if (selectedPage != null) {
        dispatch(pageReducer.setIsLoading({ isSaving: true, id: selectedPage._id }));

        const selected = dataSource.get(selectedPage._id)

        if (p.set(selected)) {
            dispatch(pageReducer.setSelected(selected));

            savePages(dbContextFactory, [selected], () => {
                dispatch(pageReducer.setIsLoading({ isSaving: false, id: selectedPage._id }))
            })
        }
    }

    dispatch(pageReducer.setAll(p.all()));
});

export const onDeletePage = createAsyncThunk<void, IPage, AsyncThunkConfig>("onDeletePage", async (page: IPage, thunkApi) => {

    const { extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections, pages } = getState();
    const { selected: selectedSection } = sections;
    const { selected: selectedPage } = pages;
    const { data: allPages } = pages;


    console.log('onDeletePage', page)
    const context = dbContextFactory();
    await context.pages.remove(page._id);

    if (selectedSection != null) {
        const [linkedSection] = await context.sections.link({ ...selectedSection })
        if (linkedSection.selectedKeys.includes(page._id)) {
            linkedSection.selectedKeys = linkedSection.selectedKeys.filter(w => w !== page._id);
        }
    }

    const parent = allPages.find(w => w.children.includes(page._id))

    if (parent) {
        const [linkedParent] = await context.pages.link(parent);
        linkedParent.children = linkedParent.children.filter(w => w !== page._id)
    }

    // await context.saveChanges();
    // const allPages = await context.pages.all();
    // const sections = await context.sections.all();
    // const dataSource = DataSource.fromArray<IPage>("_id", [...allPages]);

    // console.log(allPages, sections)

    // setSelectedPage(null);
    // setPages(dataSource);

    // if (section) {

    //     section.treeRoot = createRoot(dataSource);

    //     await context.saveChanges();

    //     setSelectedSection({ ...section });
    //     setSections([...sections])
    // }
});


export type OnSelectedKeysChangeProps = { selectedKeys: Set<string>, selectedInfos: TreeRowInfo[] }
export const onSelectedKeysChange = createAsyncThunk<void, OnSelectedKeysChangeProps, AsyncThunkConfig>("onSelectedKeysChange", async (props: OnSelectedKeysChangeProps, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections, pages } = getState();
    const { selected: selectedSection, data: allSections } = sections;
    const { data: allPages } = pages;
    const clonedSections = allSections.map(w => ({ ...w } as ISection));

    if (allPages == null || allPages.length === 0 || selectedSection == null) {
        return;
    }

    const clonedSelectedSection = { ...selectedSection };
    const { selectedKeys } = props;
    const keys = selectedKeys.size > 0 ? [selectedKeys.values().next().value] : [];
    const changes: IPage[] = [];

    allPages.forEach(w => {
        if (!w.isSelected) {
            return;
        }

        w.isSelected = false;
        changes.push(w);
    })

    if (selectedKeys.size === 1) {
        const key = selectedKeys.values().next().value;
        const page = allPages.get(key);

        page.isSelected = true;

        if (changes.some(w => w._id === page._id) === false) {
            changes.push(page)
        }
    }

    clonedSelectedSection.selectedKeys = keys;
    const index = clonedSections.findIndex(w => w.isSelected === true);
    clonedSections[index] = clonedSelectedSection;

    const savedPages = allPages.all();
    dispatch(pageReducer.setAll(savedPages));
    dispatch(sectionReducer.setAll(clonedSections));
    dispatch(sectionReducer.setSelected(clonedSelectedSection));

    savePages(dbContextFactory, savedPages, () => { });
    saveSections(dbContextFactory, [clonedSelectedSection], () => { });
});