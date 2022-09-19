import { createAsyncThunk } from "@reduxjs/toolkit";
import { ISection } from "../../data-access/entities/Section";
import { AsyncThunkConfig } from "../store";
import * as sectionReducer from "../reducers/SectionReducer";
import * as pageReducer from "../reducers/PageReducer";
import { debounce, select, sort, throttle } from "radash";
import { MindfulDataContextFactory } from "../../data-access/MindfulDataContext";
import moment from "moment";

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

export const setSection = () => {

}

export const selectSection = createAsyncThunk<void, string, AsyncThunkConfig>("selectSection", async (id: string, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections } = getState();
    const { selected, data } = sections;

    if (selected != null && selected._id === id) {
        return;
    }

    dispatch(sectionReducer.setIsSaving(true));


    const clonedSections = [...data];
    let index = -1;
    clonedSections.forEach((w, i) => {
        if (w._id === id) {
            w.isSelected = true
            index = i
            return;
        }

        w.isSelected = false
    });

    dispatch(sectionReducer.changes(clonedSections));

    updateSectionsDebounced(dbContextFactory, clonedSections, () => {
        dispatch(sectionReducer.setIsSaving(false));
    });

    if (index != -1) {

        dispatch(sectionReducer.select({ ...clonedSections[index] }));

        const context = dbContextFactory();
        const sectionPages = await context.pages.filter(w => w.sectionId === id);
        const selectedPage = sectionPages.find(w => w.isSelected === true);

        if (selectedPage != null) {
            dispatch(pageReducer.select(selectedPage));
        }

        dispatch(pageReducer.changes(sectionPages));
    }
});

export const create = createAsyncThunk<void, string, AsyncThunkConfig>("create", async (name: string, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const context = dbContextFactory();

    dispatch(sectionReducer.setIsSaving(true));

    const { sections } = getState();
    const selected = sections.selected;

    for (let item of sections.data) {
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

    if (selected) {
        const [linked] = await context.sections.link(selected);
        linked.isSelected = false
    }

    const linkedData = await context.sections.link(...sections.data);
    await context.sections.markDirty(...linkedData);

    await context.saveChanges();

    const all = await context.sections.all();

    dispatch(sectionReducer.changes(all));
    dispatch(sectionReducer.select(newSection));
    dispatch(pageReducer.select(undefined));
    dispatch(pageReducer.changes([]));
});

export const deleteSection = createAsyncThunk<void, string, AsyncThunkConfig>("deleteSection", async (id: string, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections, pages } = getState();
    const { selected } = sections;
    const context = dbContextFactory();

    const allPages = await context.pages.filter(w => w.sectionId === id);
    await context.sections.remove(id);
    await context.pages.remove(...allPages);

    await context.saveChanges();

    const allSections = await context.sections.all();

    dispatch(sectionReducer.changes(allSections));

    if (selected != null && selected._id === id) {
        dispatch(pageReducer.select(undefined));
        dispatch(pageReducer.changes([]));
        dispatch(sectionReducer.select(undefined));
    }
});

export const changeSection = createAsyncThunk<void, ISection, AsyncThunkConfig>("changeSection", async (section: ISection, thunkApi) => {

    const { dispatch, extra, getState } = thunkApi;
    const { dbContextFactory } = extra;
    const { sections } = getState();
    const { selected, data } = sections;

    dispatch(sectionReducer.setIsSaving(true));

    const shallow = [...data];
    const index = shallow.findIndex(w => w._id === section._id);
    shallow[index] = section;

    if (section._id === selected?._id) {
        dispatch(sectionReducer.select(section));
    }

    dispatch(sectionReducer.changes(shallow));

    updateSectionsDebounced(dbContextFactory, shallow, () => {
        dispatch(sectionReducer.setIsSaving(false));
    });
});



