import { IDbRecord } from "pouchdb-entity-fabric";
import { MindfulDocumentTypes } from "../MindfulDataContext";

export interface IReminder extends IDbRecord<MindfulDocumentTypes> {
    reminderName: string;
    content: string;
    sectionId: number;
    dueDate: string;
    isCompleted:boolean;
    remindMinutes?: number
}