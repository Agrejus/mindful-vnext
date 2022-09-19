import React, { useState } from 'react';
import { SplitterPaneProps, Splitter, SplitterOnChangeEvent } from '@progress/kendo-react-layout';

export interface SplitPaneState {
    panes: SplitterPaneProps[]
}

export interface SplitPaneProps {
    orientation: "vertical" | "horizontal",
    panes: SplitterPaneProps[]
}

export const SplitPane: React.FunctionComponent<SplitPaneProps> = (props) => {

    const [panes, setPanes] = useState<SplitterPaneProps[]>(props.panes)

    const onChange = (e: SplitterOnChangeEvent) => {
        setPanes(e.newState)
    }

    return <Splitter
        style={{ height: "100%" }}
        panes={panes}
        orientation={props.orientation}
        onChange={onChange}
    >
        {props.children}
    </Splitter>
}