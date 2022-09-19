import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { IPage } from '../../data-access/entities/Page'
import { DataSource } from '../../../utilities/DataSource';
import { Markers } from '../types';

// Define a type for the slice state
export interface PageState {
    data: DataSource<IPage>;
    selected: IPage | undefined;
    dirtyMarkers: Markers;
    savingMarkers: Markers;
}

// Define the initial state using that type
const initialState: PageState = {
    data: new DataSource<IPage>("_id"),
    selected: undefined,
    dirtyMarkers: {},
    savingMarkers: {}
}

export const pageSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        setOne: (state, action: PayloadAction<IPage>) => {
            const shallow = state.data.shallow();

            shallow.set(action.payload);

            state.data = shallow;
        },
        changes: (state, action: PayloadAction<IPage[]>) => {
            state.data = DataSource.fromArray("_id", action.payload)
        },
        select: (state, action: PayloadAction<IPage | undefined>) => {
            state.selected = action.payload
        },
        setIsDirtyId: (state, action: PayloadAction<{ isDirty: boolean, id: string }>) => {

            if (action.payload.isDirty === true) {
                state.dirtyMarkers = { ...state.dirtyMarkers, [action.payload.id]: new Date() };
                return;
            }

            const markers = {...state.dirtyMarkers}
            delete markers[action.payload.id];

            state.dirtyMarkers = markers;
        },
        setIsLoading: (state, action: PayloadAction<{ isSaving: boolean, id: string }>) => {
            if (action.payload.isSaving === true) {
                state.savingMarkers = { ...state.savingMarkers, [action.payload.id]: new Date() };
                return;
            }

            const markers = {...state.savingMarkers}
            delete markers[action.payload.id];

            state.savingMarkers = markers;
        }
    },
    // extraReducers: builder => {
    //     builder.addCase(setPages.pending, (state, action) => {
    //         state.isSaving = true;
    //     }).addCase(setPages.fulfilled, (state, action) => {
    //         state.isSaving = false;
    //     }).addCase(setPages.rejected, (state, action) => {
    //         state.isSaving = false;
    //     })
    // }
})

export const { changes, select, setIsLoading, setIsDirtyId, setOne } = pageSlice.actions

// Other code such as selectors can use the imported `RootState` type

export const getSelectedPage = createSelector((state: RootState) => state.pages, w => w.selected);
export const getPages = createSelector((state: RootState) => state.pages, w => w.data);
export const getDirtyMarkers = createSelector((state: RootState) => state.pages, w => w.dirtyMarkers);
export const getSavingMarkers = createSelector((state: RootState) => state.pages, w => w.savingMarkers);

export default pageSlice.reducer