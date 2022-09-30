import React, { useContext, useEffect } from "react";
import { dbContextFactory, MindfulDataContextFactory } from "../data-access/MindfulDataContext";

export const Context = React.createContext<MindfulDataContextFactory>(dbContextFactory);

interface MindfulDataContextProviderProps {

}

export const MindfulDataContextProvider: React.FunctionComponent<MindfulDataContextProviderProps> = (props) => {

    const { children } = props;
    
    return (
        <Context.Provider value={dbContextFactory}>
            {children}
        </Context.Provider>
    )
}

export function useMindfulDataContext() {
    return useContext<MindfulDataContextFactory>(Context)
}