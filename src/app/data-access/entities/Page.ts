import { IDbRecord } from 'pouchdb-entity-fabric';
import { MindfulDocumentTypes } from '../MindfulDataContext';

export interface IPage extends IDbRecord<MindfulDocumentTypes> {
    title: React.ReactNode;
    pageName: string;
    content: any;
    sectionId: string;
    isPinned: boolean;
    isSelected: boolean;
    isContextMenuVisible?: boolean;
    isSynced?: boolean;
    createDateTime: string;
    order: number;
    pageType: PageType;
    children: IPageChild[];
    path: string[];
    expanded: boolean;
}

export interface IPageChild {
    id: string;
    children: IPageChild[]
}

export enum PageType {
    PlainText = 1,
    RichText = 2,
    Markdown = 3,
    Document = 4,
    Kanban = 5,
    Links = 6,
    Nuget = 7,
    Notepad = 8,
    VisualStudio = 9,
    Apps = 10,
    Tasks = 11,
    KuduLogsExplorer = 12
}