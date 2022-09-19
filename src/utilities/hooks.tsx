import { ClickEvent } from '@szhsin/react-menu';
import React, { Dispatch, SetStateAction, useState } from 'react';

export type ClonedStateProps<T> = T & {
    mounted: boolean,
    useClonedState: <S extends {}>(state: (S | undefined) | (S | (() => S))) => [S, Dispatch<SetStateAction<S>>];
}

export function withClonedState<T extends object>(Component: React.ComponentType<ClonedStateProps<T>>): React.FunctionComponent<Omit<ClonedStateProps<T>, "mounted" | "useSafeState">> {

    return ((props: ClonedStateProps<T>) => {

        const useClonedState = <S extends {}>(state: S): [S, Dispatch<SetStateAction<S>>] => {
            const [value, setValue] = useState(state);
            const safeSetState = (value: React.SetStateAction<S>) => {
                if (value instanceof Function) {
                    setValue(value);
                    return;
                }

                setValue({ ...value });
            }
            return [value, safeSetState];
        };

        const p = {
            ...props,
            useClonedState
        }
        return <Component {...p} />
    }) as any
}

export const useMenuPreventDefault = (action: () => void) => {
    return (e: ClickEvent) => {
        e.stopPropagation = true;
        e.syntheticEvent.stopPropagation();
        action();
    }
}