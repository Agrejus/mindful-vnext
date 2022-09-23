import React, { useRef } from 'react';
import { NodeRendererProps, TreeItem } from 'react-sortable-tree';
import { IPage } from '../../../data-access/entities/Page';
import { classnames } from '../utils';
import './ReactSortableNodeContentRenderer.scss';
import { PageSortable, PageSortableMenuAction } from './sortables/PageSortable';

const isDescendant = (older: TreeItem<IPage>, younger: TreeItem<IPage>): boolean => {
    return (
        !!older.children &&
        typeof older.children !== 'function' &&
        older.children.some((child: any) => child === younger || isDescendant(child, younger))
    );
}

export interface IReactSortableNodeContentRendererExtraProps {
    onSelect: (page: IPage) => void
    renamePage: IPage | null;
    onMenuClick: (action: PageSortableMenuAction, page: IPage) => void;
}

type ReactSortableNodeContentRendererProps = NodeRendererProps<IPage> & IReactSortableNodeContentRendererExtraProps;

export const ReactSortableNodeContentRenderer: React.FunctionComponent<ReactSortableNodeContentRendererProps> = (props) => {
    const {
        onMenuClick,
        onSelect,
        renamePage,
        scaffoldBlockPxWidth,
        toggleChildrenVisibility,
        connectDragPreview,
        connectDragSource,
        isDragging,
        canDrop,
        canDrag,
        node,
        title,
        subtitle,
        draggedNode,
        path,
        treeIndex,
        isSearchMatch,
        isSearchFocus,
        buttons,
        className,
        style,
        didDrop,
        treeId,
        isOver, // Not needed, but preserved for other renderers
        parentNode, // Needed for dndManager
        rowDirection,
        ...otherProps
    } = props;
    const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : null;
    const nodeTitle = title || node.title;
    const nodeSubtitle = subtitle || node.subtitle;

    let handle: React.ReactNode | null = null;
    if (canDrag) {
        if (typeof node.children === 'function' && node.expanded) {
            // Show a loading symbol on the handle when the children are expanded
            //  and yet still defined by a function (a callback to fetch the children)
            handle = (
                <div className="rst__loadingHandle">
                    <div className="rst__loadingCircle">
                        {[...new Array(12)].map((_, index) => (
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                className={classnames('rst__loadingCirclePoint', rowDirectionClass)}
                            />
                        ))}
                    </div>
                </div>
            );
        } else {
            //, node.isSelected && "rst__rowContentsActive"
            // Show the handle used to initiate a drag-and-drop
            handle = connectDragSource(<div className={classnames('rst__rowContents', (!canDrag && 'rst__rowContentsDragDisabled'), rowDirectionClass)} >
                <PageSortable
                    onClick={() => onSelect(node)}
                    node={node}
                    onMenuClick={action => onMenuClick(action, node)}
                />
            </div>, { dropEffect: 'copy' });
        }
    }

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    let buttonStyle: { left?: number, right?: number } = { left: -0.5 * (scaffoldBlockPxWidth ?? 0) };

    if (rowDirection === 'rtl') {
        buttonStyle = { right: -0.5 * (scaffoldBlockPxWidth ?? 0) };
    }

    return <div style={{ height: '100%' }} {...otherProps}>
        {toggleChildrenVisibility &&
            node.children &&
            (node.children.length > 0 || typeof node.children === 'function') && <div>
                <button
                    type="button"
                    aria-label={node.expanded ? 'Collapse' : 'Expand'}
                    className={classnames(node.expanded ? 'fa fa-caret-down rst__collapseButton' : 'fa fa-caret-right rst__expandButton', '')}
                    style={buttonStyle}
                    onClick={() => toggleChildrenVisibility({ node, path, treeIndex })}
                />
                {node.expanded && !isDragging && <div style={{ width: scaffoldBlockPxWidth }} className={classnames('rst__lineChildren', rowDirectionClass)} />}
            </div>}

        <div className={classnames('rst__rowWrapper', rowDirectionClass)}>
            {/* Set the row preview to be used during drag and drop */}
            {connectDragPreview(
                <div
                    className={classnames(
                        'rst__row',
                        isLandingPadActive && 'rst__rowLandingPad',
                        isLandingPadActive && !canDrop && 'rst__rowCancelPad',
                        isSearchMatch && 'rst__rowSearchMatch',
                        isSearchFocus && 'rst__rowSearchFocus',
                        rowDirectionClass,
                        className
                    )}
                    style={{ opacity: isDraggedDescendant ? 0.5 : 1, ...style, }}>
                    {handle}
                </div>
            )}
        </div>
    </div>
}