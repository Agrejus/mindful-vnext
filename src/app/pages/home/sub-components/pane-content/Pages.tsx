import React, { useEffect, useRef, useState } from 'react';
import { TreeView, TreeRowInfo, TreeNode } from 'react-draggable-tree';
import { IPage, PageType } from '../../../../data-access/entities/Page';
import { ISection } from '../../../../data-access/entities/Section';
import { SortableNavButton } from '../../../../shared-components/buttons/SortableNavButton';
import { editors, getIconClass } from '../../../../shared-components/editors';
import { sort, unique } from 'radash';
import { ButtonType, Modal } from '../../../../shared-components/modal/Modal';
import { CreatableNavButton } from '../../../../shared-components/buttons/CreatableNavButton';
import { Menu, MenuItem } from '@szhsin/react-menu';
import { DataSource } from '../../../../../utilities/DataSource';
import SortableTree, { TreeItem, getTreeFromFlatData, getFlatDataFromTree } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

interface IPagesProps {
    onCreate: (name: string, type: PageType) => Promise<void>;
    onSelect: (id: string) => Promise<void>;
    onChange: (dataSource: DataSource<IPage>) => Promise<void>;
    onDelete: (page: IPage) => Promise<void>;
    pages: DataSource<IPage>;
}

export const Pages: React.FunctionComponent<IPagesProps> = (props) => {

    const { onCreate, onSelect, onChange, onDelete, pages } = props;
    const [deletePage, setDeletePage] = useState<IPage | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
    const [newPageType, setNewPageType] = useState<PageType | null>(null);
    const [renamePage, setRenamePage] = useState<IPage | null>(null);
    const inputElement = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState<string>('');

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
        setValue(page.title);
    }

    const onSavePage = async (page: IPage, name: string) => {

        page.title = name;
        pages.set(page);

        await onChange(pages);
    }

    const menuClassNames = ['dropdown-menu'];

    if (isMenuVisible) {
        menuClassNames.push('show');
    }

    const onCreateNewPage = async (name: string, type: PageType) => {
        onCreate(name, type);
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

    const onTreeChange = (data: TreeItem<IPage>[]) => {

        const flat = getFlatDataFromTree({ treeData: data, getNodeKey: w => w.node._id });

        const result = flat.map(w => {

            const page = { ...w.node } as IPage;
            page.children = (w.node.children as IPage[]).map(x => x._id);
            page.path = w.path as string[];

            return page;
        });

        // collapsing removes nodes from the data array, 
        // need to add back anything missing
        const dict = data.reduce((a, v) => ({ ...a, [v._id]: v }), {} as { [key: string]: IPage })
        const missing = pages.filter(w => dict[w._id] == null)

        onChange(DataSource.fromArray("_id", [...result, ...missing]))
    }

    const getTree = () => {
        const roots = pages.all();

        const result: TreeItem<IPage>[] = [];

        for (let i = 0; i < roots.length; i++) {
            const root = roots[i] as TreeItem<IPage>;

            if (root.children.length === 0) {
                result.push(root)
                continue;
            }

            root.children = pages.many(root.children) as any;
            result.push(root)
        }

        console.log('roots', roots)

        return result.filter(w => w.path.length === 1);
    }

    return <>
        {newPageType != null && <CreatableNavButton key={"new-page"} defaultText="New Page" onSave={name => onCreateNewPage(name, newPageType)} />}

        <div className="sort-container">
            {
                pages.length > 0 && <SortableTree
                    treeData={getTree()}
                    getNodeKey={w => w.node._id}
                    onChange={e => onTreeChange(e as any)}
                />
            }
            {/* {
                pages.length > 0 && section.treeRoot && <TreeView
                    root={section.treeRoot}
                    selectedKeys={new Set<string>(section.selectedKeys)}
                    rowHeight={36}
                    rowContent={e => {

                        const page = pages.get(e.node.key as any);

                        if (!page) {
                            return null;
                        }

                        return <SortableNavButton
                            className={"page-item-button"}
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
                    onSelectedKeysChange={(keys: any, infos) => onSelectedKeysChange(keys, infos)}
                    onCollapsedChange={onCollapsedChange}
                    onMove={onMove}
                    onCopy={onCopy}
                />
            } */}
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
            <p>Are you sure you wish to delete {deletePage.title}?</p>
        </Modal>}
    </>
}