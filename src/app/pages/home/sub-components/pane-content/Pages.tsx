import React, { useEffect, useState } from 'react';
import { IPage, IPageChild, PageType } from '../../../../data-access/entities/Page';
import { editors } from '../../../../shared-components/editors';
import { CreatableNavButton } from '../../../../shared-components/buttons/CreatableNavButton';
import { DataSource } from '../../../../../utilities/DataSource';
import SortableTree, { TreeItem, getFlatDataFromTree } from 'react-sortable-tree';
import { theme } from '../../../../shared-components/themes';
import { PageSortable, PageSortableMenuAction } from '../../../../shared-components/themes/react-sortable-theme/sortables/PageSortable';
import { DeletePageModal } from './sub-components/DeletePageModal';
import { RenameModal } from '../../../../shared-components/modal/RenameModal';
import { DirtyPages } from '../../PageContainer';

interface IPagesProps {
    onCreate: (name: string, type: PageType) => Promise<void>;
    onSelect: (id: string) => Promise<void>;
    onChange: (dataSource: DataSource<IPage>) => Promise<void>;
    onDelete: (page: IPage) => Promise<void>;
    pages: DataSource<IPage>;

    dirtyPages: DirtyPages;
}

export const Pages: React.FunctionComponent<IPagesProps> = (props) => {

    const { onCreate, onSelect, onChange, onDelete, pages, dirtyPages } = props;
    const [deletePage, setDeletePage] = useState<IPage | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
    const [newPageType, setNewPageType] = useState<PageType | null>(null);
    const [renamePage, setRenamePage] = useState<IPage | null>(null);

    useEffect(() => {

        document.addEventListener("click", async e => {

            if (e.target instanceof HTMLButtonElement && (e.target as HTMLButtonElement).classList.contains("dropdown-toggle")) {
                return;
            }

            setIsMenuVisible(false);
        });

    }, []);

    const onDeletePage = async (deleteChildren: boolean, page: IPage) => {

        if (deleteChildren === false) {
            await onDelete(page);
            setDeletePage(null);
            return;
        }


    }
    const onRenameClick = (page: IPage) => {
        // do this in a modal
        setRenamePage(page);
    }

    const onSaveRename = async (name: string, page: IPage) => {

        page.pageName = name;
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

    const onTreeChange = (data: TreeItem<IPage>[]) => {

        const flat = getFlatDataFromTree({ treeData: data, getNodeKey: w => w.node._id });

        const result = flat.map(w => {

            const page = { ...w.node } as IPage;
            page.children = (w.node.children as IPage[]).map(x => ({ id: x._id, children: x.children } as IPageChild));
            page.path = w.path as string[];

            return page;
        });

        // collapsing removes nodes from the data array, 
        // need to add back anything missing
        const dict = flat.reduce((a, v) => ({ ...a, [v.node._id]: v.node }), {} as { [key: string]: IPage })
        const missing = pages.filter(w => dict[w._id] == null);

        const source = [...result, ...missing];
        const hasError = source.filter(w => w.children.some(x => x == null));

        if (hasError.length > 0) {
            debugger;
            throw 'e'
        }

        onChange(DataSource.fromArray("_id", [...result, ...missing]));
    }

    const renderPage = (page: IPage) => {
        const p = { ...page }
        return <PageSortable
            onClick={() => onSelect(p._id)}
            node={p}
            onMenuClick={action => onMenuClick(action, p)}
            isDirty={dirtyPages[p._id]}
        />
    }

    const getTree = () => {
        const roots = pages.all();

        // get parents
        const parents = roots.filter(w => w.path.length === 1).map(w => ({
            ...w, title: renderPage(w)
        } as TreeItem<IPage>));

        for (let i = 0; i < parents.length; i++) {
            const parent = parents[i] as TreeItem<IPage>;

            if (parent.children.length === 0) {
                continue;
            }

            // walk down child path's
            const process = [parent];

            for (let j = 0; j < process.length; j++) {
                const item = process[j];

                if (item.children.length === 0) {
                    continue;
                }

                item.children = item.children.map((w: any) => {

                    const id = w._id != null ? w._id : w.id;

                    const r = pages.get(id);
                    return {
                        ...r, title: renderPage(r)
                    }
                }) as any;

                process.push(...item.children as any)
            }
        }

        return parents;
    }

    const onMenuClick = (action: PageSortableMenuAction, page: IPage) => {
        switch (action) {
            case PageSortableMenuAction.Rename:
                onRenameClick(page);
                break;
            case PageSortableMenuAction.Delete:
                setDeletePage(page);
                break;
            case PageSortableMenuAction.Duplicate:

                break;
            case PageSortableMenuAction.Select:

                break;
        }
    }

    return <>
        {newPageType != null && <CreatableNavButton key={"new-page"} defaultText="New Page" onSave={name => onCreateNewPage(name, newPageType)} />}

        <div className="sort-container">
            {
                pages.length > 0 && <SortableTree
                    treeData={getTree()}
                    getNodeKey={w => w.node._id}
                    onChange={e => onTreeChange(e as any)}
                    theme={theme}
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
        {deletePage && <DeletePageModal
            all={pages.shallow().all()}
            page={deletePage}
            onClose={() => setDeletePage(null)}
            onDelete={deleteChildren => onDeletePage(deleteChildren, deletePage)}
        />}
        {renamePage && <RenameModal
            initialValue={renamePage.pageName}
            inputHeader="Page Title"
            title="Rename Page"
            onClose={() => setRenamePage(null)}
            onSave={name => onSaveRename(name, renamePage)}
        />}
    </>
}