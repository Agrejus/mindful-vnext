import React, { useEffect, useState } from 'react';
import { IPage, PageType } from '../../../../data-access/entities/Page';
import { editors } from '../../../../shared-components/editors';
import { CreatableNavButton } from '../../../../shared-components/buttons/CreatableNavButton';
import { DataSource } from '../../../../../utilities/DataSource';
import SortableTree, { } from 'react-sortable-tree';
import { getTheme } from '../../../../shared-components/themes';
import { IReactSortableNodeContentRendererExtraProps } from '../../../../shared-components/themes/react-sortable-theme/ReactSortableNodeContentRenderer';
import { PageSortableMenuAction } from '../../../../shared-components/themes/react-sortable-theme/sortables/PageSortable';
import { DeletePageModal } from './sub-components/DeletePageModal';
import { RenameModal } from '../../../../shared-components/modal/RenameModal';

interface IPagesProps {
    onCreate: (name: string, type: PageType) => Promise<void>;
    onSelect: (id: string) => Promise<void>;
    onChange: (dataSource: DataSource<IPage>) => Promise<void>;
    onDelete: (pageIds: string[]) => Promise<void>;
    pages: DataSource<IPage>;
}

export const Pages: React.FunctionComponent<IPagesProps> = (props) => {

    const { onCreate, onSelect, onChange, onDelete, pages } = props;
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

    const onDeletePage = async (pageIds: string[]) => {
        await onDelete(pageIds);
        setDeletePage(null);
    }

    const onRenameClick = (id: string) => {

        const page = pages.get(id);

        // do this in a modal
        setRenamePage(page);
    }

    const onSaveRename = async (name: string, page: IPage) => {

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

    // const getTreeFromFlatData = (data: IPage[]): TreeItem<IPage>[] => {
    //     const traverse = [...data];
    //     const result: TreeItem<IPage>[] = [];
    //     const skips: { [key: string]: any } = {};
    //     const dictionary = data.reduce((a, v) => ({ ...a, [v._id]: v }), {} as { [key: string]: IPage });

    //     for (let i = 0; i < traverse.length; i++) {
    //         const item = traverse[i];

    //         dictionary[item._id] = item;

    //         if (skips[item._id]) {
    //             continue
    //         }

    //         if (item.path.length > 1) {

    //             const parentId = item.path[item.path.length - 2];
    //             const parent = dictionary[parentId];

    //             parent.children = parent.children.map(w  => dictionary[w] as any)

    //             continue;
    //         }

    //         result.push(dictionary[item._id] as TreeItem<IPage>);
    //     }
    //     debugger;
    //     return result;
    // }


    // const getTree = () => {
    //     const roots = pages.all();
    //     debugger;
    //     getTreeFromFlatData(roots);
    //     const result: TreeItem<IPage>[] = [];

    //     for (let i = 0; i < roots.length; i++) {
    //         const root = roots[i] as TreeItem<IPage>;

    //         if (root.children.length === 0) {
    //             result.push(root)
    //             continue;
    //         }

    //         root.children = pages.many(root.children) as any;
    //         result.push(root)
    //     }

    //     // const issues = result.filter(w => w.children.some(x => x == null));

    //     // if (issues.length > 0) {
    //     //     debugger;
    //     //     for(let issue of issues) {
    //     //         issue.children = roots.filter(w => w.path.length > 1 && w.path[w.path.length - 1] === issue._id) as any;
    //     //     }
    //     // }

    //     return result.filter(w => w.path.length === 1);
    // }

    const onTreeChange = (data: IPage[]) => {
        debugger;
        onChange(DataSource.fromArray("_id", data))
    }

    const onMenuClick = (action: PageSortableMenuAction, page: IPage) => {
        switch (action) {
            case PageSortableMenuAction.Rename:
                onRenameClick(page._id);
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

    //https://github.com/frontend-collective/react-sortable-tree
    const themeExtraProps: IReactSortableNodeContentRendererExtraProps = {
        onMenuClick,
        onSelect: page => onSelect(page._id),
        renamePage
    }

    const theme = getTheme(themeExtraProps);
    console.log(pages)

    return <>
        {newPageType != null && <CreatableNavButton key={"new-page"} defaultText="New Page" onSave={name => onCreateNewPage(name, newPageType)} />}

        <div className="sort-container">
            <SortableTree
                treeData={pages.clone().all()}
                getNodeKey={w => w.node._id}
                onChange={onTreeChange}
                theme={theme}
            />
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
            onDelete={onDeletePage}
        />}
        {renamePage && <RenameModal
            initialValue={renamePage.title as any}
            inputHeader="Please type a new page name"
            onClose={() => setRenamePage(null)}
            onSave={name => onSaveRename(name, renamePage)}
            title='Rename Page'
        />}
    </>
}