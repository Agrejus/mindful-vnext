
import { configureStore, ThunkAction, Action, combineReducers, Dispatch, Middleware, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { dbContextFactory, MindfulDataContextFactory } from '../data-access/MindfulDataContext';
import pages from './reducers/PageReducer';
import sections from './reducers/SectionReducer';

const rootReducer = combineReducers({ pages, sections });

const loggerMiddleware: Middleware<{}, unknown, ThunkDispatch<unknown, unknown, AnyAction>> = store => next => action => {

    const previousState = store.getState();
    console.group('state')
    console.log(previousState)

    const nextState = next(action);
    console.log(nextState)
    console.groupEnd()

    return nextState;
}

export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: { extraArgument: { dbContextFactory } }, serializableCheck: false }).concat(loggerMiddleware),
});

export type ThunkExtraArgs = { dbContextFactory: MindfulDataContextFactory }
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export type AsyncThunkConfig = {
    state: RootState;
    dispatch: Dispatch;
    extra: ThunkExtraArgs;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector