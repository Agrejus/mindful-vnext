import { AnyAction, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import moment from "moment";
import { debounce, throttle } from "radash";
import { TreeNode } from "react-draggable-tree";
import { DataSource } from "../../../utilities/DataSource";
import { IPage, PageType } from "../../data-access/entities/Page";
import { MindfulDataContextFactory } from "../../data-access/MindfulDataContext";
import { getDefaultContent } from "../../shared-components/editors";
import * as pageReducer from "../reducers/PageReducer";
import { AsyncThunkConfig, RootState, ThunkExtraArgs } from "../store";

const updatePagesDebounced = debounce({ delay: 1500 }, throttle({ interval: 1500 }, async (dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => {
    const context = dbContextFactory();

    const s = performance.now()
    // const linked = await context.pages.link(page);
    // await context.pages.markDirty(...linked);
    await context.pages.upsert(...pages);
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

export type CreatePageProps = { name: string, type: PageType }
export const create = createAsyncThunk<void, CreatePageProps, AsyncThunkConfig>("setSelectedPage", async (props: CreatePageProps, thunkApi) => {

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
        isContextMenuVisible: false
    });

    const dataSource = data.shallow();
    dataSource.push(page)
    linkedSection.treeRoot = createRoot(dataSource);
    await context.saveChanges();
    const final = await context.pages.all()

    dispatch(pageReducer.changes(final));
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

    dispatch(pageReducer.setIsLoading({ isSaving: true, id }))

    const changedPages = data.all();
    const selectedKeys: string[] = []

    for (let page of changedPages) {
        if (page._id === id) {
            selectedKeys.push(id);
            page.isSelected = true;
            dispatch(pageReducer.select(page))
            continue;
        }

        page.isSelected = false;
    }

    selectedSection.selectedKeys = selectedKeys;

    updatePagesDebounced(dbContextFactory, changedPages, () => {
        dispatch(pageReducer.setIsLoading({ isSaving: false, id }))
    });

    dispatch(pageReducer.changes(changedPages));
});

export const onContentChage = createAsyncThunk<void, any, AsyncThunkConfig>("onContentChage", async (content: any, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections, pages } = getState();
    const { selected: selectedSection } = sections;
    const { selected: selectedPage } = pages;
    const { data } = pages;

    if (selectedPage == null || selectedSection == null) {
        return;
    }

    dispatch(pageReducer.setIsLoading({ isSaving: true, id: selectedPage._id }))

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
    dispatch(pageReducer.select(page));


    updatePagesDebounced(dbContextFactory, [page], () => {
        dispatch(pageReducer.setIsLoading({ isSaving: false, id: selectedPage._id }))
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
            dispatch(pageReducer.select(selected));

            updatePagesDebounced(dbContextFactory, [selected], () => {
                dispatch(pageReducer.setIsLoading({ isSaving: false, id: selectedPage._id }))
            })
        }
    }

    dispatch(pageReducer.changes(p.all()));
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

