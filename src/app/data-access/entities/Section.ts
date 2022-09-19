import { IDbRecord } from "pouchdb-entity-fabric";
import { TreeNode } from "react-draggable-tree";
import { MindfulDocumentTypes } from "../MindfulDataContext";

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
    treeRoot: TreeNode | null;
    selectedKeys: string[];
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


