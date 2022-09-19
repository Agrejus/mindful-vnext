import { IDbRecord } from 'pouchdb-entity-fabric';
import { MindfulDocumentTypes } from '../MindfulDataContext';

export interface INotification extends IDbRecord<MindfulDocumentTypes> {
    notificationId: number;
    pageId: number;
    diff: number;
}