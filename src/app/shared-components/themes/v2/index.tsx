import { ReactSortableNodeContentRenderer } from "./ReactSortableNodeContentRenderer";
import { ReactSortablePlaceHolderRenderer } from "./ReactSortablePlaceHolderRenderer";
import { ReactSortableTreeNodeRenderer } from "./ReactSortableTreeNodeRenderer";

export const theme = {
    nodeContentRenderer: ReactSortableNodeContentRenderer,
    placeholderRenderer: ReactSortablePlaceHolderRenderer,
    rowHeight: 36,
    scaffoldBlockPxWidth: 20,
    slideRegionSize: 100,
    treeNodeRenderer: ReactSortableTreeNodeRenderer
}