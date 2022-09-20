import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { ISection } from '../../data-access/entities/Section'
import { sort } from 'radash';

// Define a type for the slice state
export interface SectionState {
    data: ISection[];
    selected: ISection | undefined;
    isSaving: boolean;
}

// Define the initial state using that type
const initialState: SectionState = {
    data: [],
    selected: undefined,
    isSaving: false
}

export const sectionSlice = createSlice({
    name: 'sections',
    initialState,
    reducers: {
        setAll: (state, action: PayloadAction<ISection[]>) => {
            state.data = [...sort(action.payload, w => w.order)]
        },
        setSelected: (state, action: PayloadAction<ISection | undefined>) => {
            state.selected = action.payload == null ? undefined : { ...action.payload } as ISection
        },
        setIsSaving: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload
        }
    },
})

export const { setAll, setSelected, setIsSaving } = sectionSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const getSelectedSection = createSelector((state: RootState) => state.sections, w => w.selected);
export const getSections = createSelector((state: RootState) => state.sections, w => w.data.map(w => ({ ...w })));

export default sectionSlice.reducer