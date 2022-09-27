import { IDbRecord } from 'pouchdb-entity-fabric';
import { TreeItem } from 'react-sortable-tree';
import { MindfulDocumentTypes } from '../MindfulDataContext';


interface IPageContents {
    content: any;
    sectionId: string;
    isPinned: boolean;
    isSynced?: boolean;
    createDateTime: string;
    pageType: PageType;
}

export interface IPage extends TreeItem<IDbRecord<MindfulDocumentTypes> & IPageContents> {

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