import { IDbRecord } from "pouchdb-entity-fabric";
import { MindfulDocumentTypes } from "../MindfulDataContext";
import { IPage } from "./Page";

export interface ISection extends IDbRecord<MindfulDocumentTypes> {
    sectionName: string;
    order: number;
    color: string;
    isDisabled: boolean;
    isSelected: boolean;
    createDateTime: string;
    isContextMenuVisible?: boolean;
    widgets: IWidget[];
    settings: ISectionSettings;
    isArchived: boolean;
    treeRoot: IPage | null;
}

export interface ISectionSettings {
    url?: string;
}

export interface IWidget {
    data: any;
    type: number;
}

export enum SectionWidgetType {
    KanbanNonCompleted = 1,
    Priority = 2
}