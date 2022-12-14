import React, { useEffect, useRef, useState } from 'react';
import { TreeView, TreeRowInfo, TreeNode } from 'react-draggable-tree';
import { IPage, PageType } from '../../../../data-access/entities/Page';
import { ISection } from '../../../../data-access/entities/Section';
import { SortableNavButton } from '../../../../shared-components/buttons/SortableNavButton';
import { editors, getIconClass } from '../../../../shared-components/editors';
import { unique } from 'radash';
import { ButtonType, Modal } from '../../../../shared-components/modal/Modal';
import { CreatableNavButton } from '../../../../shared-components/buttons/CreatableNavButton';
import { Menu, MenuItem } from '@szhsin/react-menu';
import * as pageActions from '../../../../redux/actions/PageActions';
import * as sectionActions from '../../../../redux/actions/SectionActions';
import * as pageReducer from '../../../../redux/reducers/PageReducer';
import * as sectionReducer from '../../../../redux/reducers/SectionReducer';
import { DataSource } from '../../../../../utilities/DataSource';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';

interface IPagesProps {

}

export const Pages: React.FunctionComponent<IPagesProps> = (props) => {

    const [deletePage, setDeletePage] = useState<IPage | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
    const [newPageType, setNewPageType] = useState<PageType | null>(null);
    const [renamePage, setRenamePage] = useState<IPage | null>(null);
    const inputElement = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState<string>('');

    const pages = useAppSelector(pageReducer.getPages);
    const parent = useAppSelector(sectionReducer.getSelectedSection);
    const dirtyPages = useAppSelector(pageReducer.getDirtyMarkers);
    const dispatch = useAppDispatch();

    const onCreate = (name: string, type: PageType) => dispatch(pageActions.onCreatePage({ name, type }));
    const onSelect = (id: string) => dispatch(pageActions.selectPage(id));
    const onSectionChange = (section: ISection) => dispatch(sectionActions.changeSection(section));
    const onChange = (dataSource: DataSource<IPage>) => dispatch(pageActions.onPagesChange(dataSource.all()));
    const onDelete = (page: IPage) => dispatch(pageActions.onDeletePage(page));
    const onSelectedKeysChange = (selectedKeys: Set<string>, selectedInfos: TreeRowInfo[]) => dispatch(pageActions.onSelectedKeysChange({ selectedInfos, selectedKeys }));

    useEffect(() => {

        document.addEventListener("click", async e => {

            if (renamePage != null && (e.target as HTMLElement).classList.contains("nav-button-input") === false) {
                await onSavePage(renamePage, value);
                setValue('');
                setRenamePage(null);
                return;
            }

            if (e.target instanceof HTMLButtonElement && (e.target as HTMLButtonElement).classList.contains("dropdown-toggle")) {
                return;
            }

            setIsMenuVisible(false);
        });

    }, []);

    useEffect(() => {
        if (inputElement?.current) {
            inputElement.current.focus();
        }
    })

    const getDescendant = (root: TreeNode, path: number[]): TreeNode | undefined => {
        if (path.length == 0) {
            return root
        }

        if (root.children) {
            return getDescendant(root.children[path[0]], path.slice(1));
        }
    }

    const onDeletePage = async (type: ButtonType, page: IPage) => {

        if (type !== 'Yes') {
            setDeletePage(null);
            return;
        }

        await onDelete(page);
        setDeletePage(null);
    }

    const onRenameClick = (page: IPage) => {
        setRenamePage(page);
        setValue(page.pageName);
    }

    const onMove = async (src: TreeRowInfo[], dest: TreeRowInfo, destIndex: number, destPathAfterMove: number[]) => {

        if (parent.treeRoot == null) {
            return;
        }

        const items: TreeNode[] = [];
        const changedParents: TreeNode[] = [];

        for (let i = src.length - 1; i >= 0; --i) {
            const { path } = src[i];
            const index = path[path.length - 1]
            const p = getDescendant(parent.treeRoot, path.slice(0, -1))!
            const [item] = p.children!.splice(index, 1);
            changedParents.push(p);
            items.unshift(item);
        }

        const destItem = getDescendant(parent.treeRoot, destPathAfterMove.slice(0, -1))!;
        destItem.children!.splice(destPathAfterMove[destPathAfterMove.length - 1], 0, ...items);
        destItem.collapsed = false;

        const changes: IPage[] = [...items, ...changedParents, destItem].filter(w => w.key != -1).map(w => {
            const page = pages.get(w.key as string);
            page.children = !w.children ? [] : w.children.map(x => x.key as string);
            return page;
        });

        const rootOrderChanges = !parent.treeRoot.children ? [] : parent.treeRoot.children.map((w, i) => {
            const page = pages.get(w.key as string);
            page.order = i;
            return page;
        });

        const final = unique([...changes, ...rootOrderChanges], w => w._id)

        await onChange(pages);
        await onSectionChange(parent);
    }

    const onCopy = (src: TreeRowInfo[], dest: TreeRowInfo, destIndex: number) => {
        console.log('copy')
        // const {root} = this.state
        // const items: ExampleItem[] = []
        // for (let i = src.length - 1; i >= 0; --i) {
        //   const {path} = src[i]
        //   const index = path[path.length - 1]
        //   const parent = root.getDescendant(path.slice(0, -1))!
        //   const item = parent.children![index].clone()
        //   items.unshift(item)
        // }
        // const destItem = root.getDescendant(dest.path)!
        // destItem.children!.splice(destIndex, 0, ...items)
        // destItem.collapsed = false
        // this.setState({root})
    }

    const onCollapsedChange = async (info: TreeRowInfo, collapsed: boolean) => {

        if (parent.treeRoot == null || pages == null) {
            return;
        }

        const node = getDescendant(parent.treeRoot, info.path);

        if (!node) {
            return;
        }

        node.collapsed = collapsed;

        const page = pages.get(node.key as string);

        page.isCollapsed = collapsed;

        await onChange(pages);
        await onSectionChange(parent);
    }

   

    const onSavePage = async (page: IPage, name: string) => {

        page.pageName = name;
        pages.set(page);

        await onChange(pages);
    }

    const menuClassNames = ['dropdown-menu'];

    if (isMenuVisible) {
        menuClassNames.push('show');
    }

    const onCreateNewPage = async (name: string, type: PageType) => {
        await onCreate(name, type);
        setNewPageType(null);
    }

    const onBlur = async () => {

        if (renamePage == null) {
            return;
        }

        await onSavePage(renamePage, value);
        setValue('');
        setRenamePage(null);
    }

    const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.which === 13) {
            e.preventDefault();

            if (renamePage != null) {
                await onSavePage(renamePage, value);
                setValue('');
                setRenamePage(null);
            }
            return;
        }
    }

    if (parent == null) {
        return null;
    }

    return <>
        {newPageType != null && <CreatableNavButton key={"new-page"} defaultText="New Page" onSave={name => onCreateNewPage(name, newPageType)} />}

        <div className="sort-container">
            {
                pages.length > 0 && parent.treeRoot && <TreeView
                    root={parent.treeRoot}
                    selectedKeys={new Set<string>(parent.selectedKeys)}
                    rowHeight={36}
                    rowContent={e => {

                        const page = pages.get(e.node.key as any);

                        if (!page) {
                            return null;
                        }

                        const classNames: string[] = ['page-item-button'];

                        if (dirtyPages[page._id]) {
                            classNames.push('page-item-button-unsaved')
                        }

                        return <SortableNavButton
                            className={classNames.join(' ')}
                            keyPart="page-sortable-key"
                            displayField="pageName"
                            icon={getIconClass(page.pageTypeId)}
                            idField={'_id'}
                            onClick={onSelect}
                            dataItem={page}
                            isSelected={page.isSelected}>
                            {renamePage?._id === page._id && <input className='nav-button-input' ref={inputElement} onBlur={onBlur} onKeyDown={onKeyDown} onChange={e => setValue(e.target.value)} value={value} />}
                            <Menu menuButton={<i className="bi bi-three-dots-vertical kanban-card-header-actions clickable pull-right" onClick={e => { e.preventDefault(); e.stopPropagation(); }}></i>} transition>
                                <MenuItem onClick={() => onRenameClick(page)}><i className='fas fa-i-cursor'></i>&nbsp;Rename</MenuItem>
                                <MenuItem onClick={() => void (0)}><i className='far fa-clone'></i>&nbsp;Duplicate</MenuItem>
                                <MenuItem onClick={() => setDeletePage(page)}><i className='far fa-trash-alt text-danger'></i>&nbsp;Delete</MenuItem>
                            </Menu>
                        </SortableNavButton>
                    }}
                    onSelectedKeysChange={(keys, infos) => onSelectedKeysChange(keys as any, infos)}
                    onCollapsedChange={onCollapsedChange}
                    onMove={onMove}
                    onCopy={onCopy}
                />
            }
        </div>
        <div className="btn-group dropup nav-button nav-button-add nav-button-split pages-add-btn-group">
            <button type="button" className="" onClick={() => onCreateNewPage("New Page", PageType.PlainText)}>
                <i className="bi bi-plus icon-md"></i>&nbsp;Add Page
            </button>
            <button type="button" onClick={() => setIsMenuVisible(true)} className="dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span className="sr-only">Toggle Dropdown</span>
            </button>
            <div className={menuClassNames.join(' ')}>
                {editors.map((w, i) => <a key={`add-page-menu-${i}`} onClick={() => setNewPageType(w.type)}><i className={w.icon}></i>&emsp;Add {w.displayName} Page</a>)}
            </div>
        </div>
        {deletePage && <Modal
            buttons={["Yes", "Cancel"]}
            onClick={e => onDeletePage(e, deletePage)}
            title="Delete Page?"
        >
            <p>Are you sure you wish to delete {deletePage.pageName}?</p>
        </Modal>}
    </>
}