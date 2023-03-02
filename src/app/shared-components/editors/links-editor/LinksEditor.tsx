import React, { forwardRef, PropsWithChildren, useImperativeHandle, useRef, useState } from 'react';
import { ButtonType, Modal } from '../../modal/Modal';
import './LinksEditor.scss';
import { MultiSelect, MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns';
import { EditorProps, IEditor, ToolbarEditorProps, IEditorApi } from '..';
import { sort, unique } from 'radash';
import { IPage, PageType } from '../../../data-access/entities/Page';
import { ContentToolbarButtonGroup } from '../../toolbar/content-toolbar-button-group/ContentToolbarButtonGroup';
import { ContentToolbarHorizontalButton } from '../../toolbar/content-toolbar-buttons/ContentToolbarHorizontalButton';
import { ContentToolbarGroup } from '../../toolbar/content-toolbar-group/ContentToolbarGroup';
import { ContentToolbarLabel } from '../../toolbar/content-toolbar-label/ContentToolbarLabel';
import { ContentToolbarDivider } from '../../toolbar/content-toolbar-divider/ContentToolbarDivider';


export interface ILink {
    id: number;
    link: string;
    name: string;
    tags: string[];
    timesOpened: number;
}

export interface ILinksEditorApi extends IEditorApi {
    addLink: () => void;
}

const LinksEditor = forwardRef<ILinksEditorApi, PropsWithChildren<EditorProps>>((props, ref) => {

    const { content, onChange } = props;
    const links = content as ILink[];
    const [editLinkIndex, setEditLinkIndex] = useState<number | null>(null);
    const [deleteLinkIndex, setDeleteLinkIndex] = useState<number | null>(null);
    const [filterText, setFilterText] = useState<string>('');
    const [tagFilter, setTagFilter] = useState<string>('');
    const [isAddLinkModalVisible, setIsAddLinkModalVisible] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        addLink: () => setIsAddLinkModalVisible(true)
    }), []);

    const onAddEditLink = (link: ILink) => {

        if (editLinkIndex == null) {
            links.push(link);
        } else {
            links[editLinkIndex] = link;
        }

        onChange(links);
        setEditLinkIndex(null);
        setIsAddLinkModalVisible(false);
    }

    const onLinkClick = async (link: ILink) => {
        const index = links.findIndex(w => w.id === link.id);
        links[index].timesOpened++;
        onChange(links);
        //services.fileService.openFile(link.link);
    }

    const handleLinkDelete = (button: ButtonType) => {
        if (button === "Yes" && deleteLinkIndex != null) {
            links.splice(deleteLinkIndex, 1);
            onChange(links);
        }
        setDeleteLinkIndex(null);
    }

    const filterLinks = (link: ILink) => {
        const lower = filterText.toLowerCase();

        if (!filterText && !tagFilter) {
            return true;
        }

        if (filterText && !tagFilter) {
            return link.link.toLowerCase().includes(lower) || link.name.toLowerCase().includes(lower) || link.tags?.some(x => x.toLowerCase().includes(lower));
        }

        if (!filterText && tagFilter) {
            return link.tags?.some(w => w === tagFilter);
        }

        return (link.link.toLowerCase().includes(lower) || link.name.toLowerCase().includes(lower) || link.tags?.some(x => x.toLowerCase().includes(lower))) && (link.tags?.some(w => w === tagFilter));
    }

    const onCopyClick = (link: ILink) => {
        const tempInput = document.createElement("input");
        tempInput.value = link.link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);

        //publishNotification({ message: "Copied to clipboard" })
    }

    const orderedLinks = sort(links, w => w.timesOpened, true)
    const filteredLinks = orderedLinks.filter(filterLinks);
    let tags: string[] = [];
    const reduce = links.filter(w => w.tags && w.tags.length > 0).map(w => w.tags);
    if (reduce.length > 0) {
        tags = unique(reduce.reduce((a, b) => a.concat(b)));
    }

    return <div className="links-container">
        <div className="link-list">
            <div className="link-list-filter-container">
                <div>
                    <input className="form-control" placeholder="search..." value={filterText} onChange={e => setFilterText(e.target.value)} />
                </div>
                <div className="text-center link-tag-filter-container">
                    <span className="link-tag" onClick={() => setTagFilter("")}>All</span>
                    {
                        tags?.map((w, i) => {

                            const isActive = w === tagFilter;
                            return <span key={`${w}-${i}-main`} className={`link-tag${isActive ? " link-tag-active" : ""}`} onClick={() => setTagFilter(w)}>{w}{isActive && <React.Fragment>&emsp;<i className="fas fa-filter"></i></React.Fragment>}</span>
                        })
                    }
                </div>
            </div>
            <div>
                <h4>Links <small>({links.length})</small></h4>
                {
                    filteredLinks.map((w, i) => <div key={`app-link-${i}`} className="text-center card">
                        <div className="card-name">
                            <span className="clickable" onClick={() => onLinkClick(w)}>{w.name}</span>&nbsp;<i className="bi bi-pencil-square clickable" onClick={() => setEditLinkIndex(i)}></i><i className="bi bi-files clickable" onClick={() => onCopyClick(w)}></i>
                            <a title={w.link} className="clickable link" onClick={() => onLinkClick(w)}>{w.link}</a>
                        </div>
                        <i className="bi bi-x clickable card-close" onClick={() => setDeleteLinkIndex(i)}></i>
                        <div className="card-actions">
                            <div className="btn-group">
                                {
                                    w.tags?.map((x, j) => <span key={`${w}-${j}`} className="link-tag">{x}</span>)
                                }
                            </div>
                        </div>
                    </div>)
                }
            </div>
        </div>
        {isAddLinkModalVisible && <AddEditLinkModal
            tags={tags}
            onClose={() => setIsAddLinkModalVisible(false)}
            onSuccess={onAddEditLink}
            nextId={links.length + 1}
        />}
        {deleteLinkIndex != null && <Modal
            buttons={["Yes", "Cancel"]}
            onClick={handleLinkDelete}
            title="Delete Link?"
        >
            <p>Are you sure?</p>
        </Modal>}
        {editLinkIndex != null && <AddEditLinkModal
            tags={tags}
            onClose={() => setEditLinkIndex(null)}
            onSuccess={onAddEditLink}
            link={links[editLinkIndex]}
            nextId={links.length + 1}
        />}
    </div>
});

interface AddLinkModalProps {
    onClose: () => void;
    onSuccess: (link: ILink) => void;
    tags: string[];
    link?: ILink;
    nextId: number;
}

interface AddLinkModalState {
    link: string;
    name: string;
    tags: string[];
    timesOpened: number;
    currentOrNextId: number;
}

class AddEditLinkModal extends React.PureComponent<AddLinkModalProps, AddLinkModalState> {

    state: AddLinkModalState = {
        name: this.props.link?.name ?? "",
        link: this.props.link?.link ?? "",
        tags: this.props.link?.tags ?? [],
        timesOpened: this.props.link?.timesOpened ?? 0,
        currentOrNextId: this.props.link?.id ?? this.props.nextId
    }

    onClick = (button: ButtonType) => {
        if (button === "Cancel") {
            this.props.onClose();
            return;
        }

        this.props.onSuccess({
            name: this.state.name,
            link: this.state.link,
            tags: this.state.tags,
            timesOpened: this.state.timesOpened,
            id: this.state.currentOrNextId
        });
    }

    onTagsChange = (e: MultiSelectChangeEvent) => {
        const tags = [...e.target.value] as string[];
        this.setState({ tags })
    }

    render() {
        return <Modal<ILink, string[]>
            buttons={["Ok", "Cancel"]}
            onClick={this.onClick}
            title=""
            extraData={this.props.tags}>
            <div className="row">
                <div className="col-sm-12">
                    <label>Name</label>
                    <input type="text" className="form-control" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <label>URL</label>
                    <input type="text" className="form-control" value={this.state.link} onChange={e => this.setState({ link: e.target.value })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <label>Tags</label>
                    <MultiSelect
                        data={this.props.tags}
                        onChange={this.onTagsChange}
                        value={this.state.tags}
                        allowCustom={true}
                    />
                </div>
            </div>
        </Modal>
    }
}

const LinksEditorHeader: React.FC<ToolbarEditorProps<ILinksEditorApi>> = (props) => {

    return <>
        <ContentToolbarGroup>
            <ContentToolbarButtonGroup>
                <ContentToolbarHorizontalButton icon={<div className='bi-stacked-icons bi-stacked-icon bi-stacked-icons-kitty-corner'><i className='bi bi-link-45deg'></i><i className='bi bi-plus bi-stacked-icon-action text-success'></i></div>} label='Add Link' onClick={props.editorApi.addLink} />
            </ContentToolbarButtonGroup>
            <ContentToolbarLabel name='Link Actions' />
        </ContentToolbarGroup>
        <ContentToolbarDivider />
    </>
}

export const linksEditor: IEditor<EditorProps, ILinksEditorApi> = {

    getComponent: () => LinksEditor,
    stringifySearchContent: (content: ILink[]) => content.map(w => `${w.name} ${w.link}`).join(" "),
    renderToolbar: (props: ToolbarEditorProps<ILinksEditorApi>) => <LinksEditorHeader {...props} />,
    getDefaultContent: () => [],
    parse: (page: IPage) => JSON.parse(page.content),
    stringify: (page: IPage) => JSON.stringify(page.content),
    type: PageType.Links,
    icon: "far fa-hand-pointer",
    displayName: "Links"
}