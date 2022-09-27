import React from 'react';
import { IReactSortableNodeContentRendererExtraProps, ReactSortableNodeContentRenderer } from './react-sortable-theme/ReactSortableNodeContentRenderer';
import { ReactSortableTreeNodeRenderer } from './react-sortable-theme/ReactSortableTreeNodeRenderer';
import { ReactSortablePlaceHolderRenderer } from './react-sortable-theme/ReactSortablePlaceHolderRenderer';
// import { DefaultPlaceHolderRenderer } from './default/DefaultPlaceHolderRenderer';
// import { DefaultTreeNodeRenderer } from './default/DefaultTreeNodeRenderer';
// import { DefaultNodeContentRenderer } from './default/DefaultNodeContentRenderer';

export const getTheme = (extraProps: IReactSortableNodeContentRendererExtraProps) => {

    return {
        nodeContentRenderer: (props: any) => {
            const final = { ...props, ...extraProps as any }
            return <ReactSortableNodeContentRenderer {...final} />
        },
        placeholderRenderer: ReactSortablePlaceHolderRenderer,
        rowHeight: 36,
        scaffoldBlockPxWidth: 20,
        slideRegionSize: 100,
        treeNodeRenderer: ReactSortableTreeNodeRenderer
    }
}

// export const getDefaultTheme = () => {

//     return {
//         nodeContentRenderer: DefaultNodeContentRenderer,
//         placeholderRenderer: DefaultPlaceHolderRenderer,
//         rowHeight: 62,
//         scaffoldBlockPxWidth: 44,
//         slideRegionSize: 100,
//         treeNodeRenderer: DefaultTreeNodeRenderer
//     }
// }