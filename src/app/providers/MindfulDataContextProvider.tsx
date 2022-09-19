import React, { useContext, useEffect } from "react";
import { dbContextFactory, MindfulDataContextFactory } from "../data-access/MindfulDataContext";

export const Context = React.createContext<MindfulDataContextFactory>(dbContextFactory);

interface MindfulDataContextProviderProps {

}

export const MindfulDataContextProvider: React.FunctionComponent<MindfulDataContextProviderProps> = (props) => {

    const { children } = props;

    useEffect(() => {
        // let sync: { cancel: () => void; } | null = null;
        // const setup = async () => {
        //     const context = dbContextFactory();
        //     sync = await context.initializeSync({
        //         change: (info) => {

        //         }
        //     })
        // }

        // setup();


        // return () => {
        //     if (sync != null) {
        //         sync.cancel();
        //     }
        // }
    }, [])

    return (
        <Context.Provider value={dbContextFactory}>
            {children}
        </Context.Provider>
    )
}

export function useMindfulDataContext() {
    return useContext<MindfulDataContextFactory>(Context)
}