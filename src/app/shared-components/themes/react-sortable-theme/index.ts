import { ThemeProps } from "react-sortable-tree";
import { IPage } from '../../../data-access/entities/Page';
import { ReactSortableNodeContentRenderer } from './ReactSortableNodeContentRenderer';
import { ReactSortableTreeNodeRenderer } from './ReactSortableTreeNodeRenderer';
import { ReactSortablePlaceHolderRenderer } from './ReactSortablePlaceHolderRenderer';

export const ReactSortableTheme: ThemeProps<IPage> = {
    nodeContentRenderer: ReactSortableNodeContentRenderer,
    placeholderRenderer: ReactSortablePlaceHolderRenderer,
    rowHeight: 62,
    scaffoldBlockPxWidth: 44,
    slideRegionSize: 100,
    treeNodeRenderer: ReactSortableTreeNodeRenderer
}