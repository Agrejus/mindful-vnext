/// <reference path="../../../config.d.ts" />
import { DataContext, DataContextOptions } from "pouchdb-entity-fabric"
import { parse, stringify } from "../shared-components/editors";
import { INotification } from "./entities/Notification"
import { IPage } from "./entities/Page";
import { ISection } from "./entities/Section";
import PouchDB from 'pouchdb';

export enum MindfulDocumentTypes {
    Notifications = "Notifications",
    Pages = "Pages",
    Sections = "Sections",
    TreeData = "TreeData",
}

export class MindfulDataContext extends DataContext<MindfulDocumentTypes> {

    protected async doWork<T>(action: (db: PouchDB.Database) => Promise<T>, shouldClose: boolean = true) {
        const db = this.createDb();
        const result = await action(db);

        // Closing the connection only makes sense for IndexedDb
        // https://github.com/pouchdb/pouchdb/issues/3429#issuecomment-71043588
        return result;
    }

    initializeSync(callbacks?: {
        change?: (info: PouchDB.Replication.SyncResult<{}>) => void,
        paused?: (err: any) => void,
        active?: () => void,
        denied?: (err: any) => void,
        complete?: (info: PouchDB.Replication.SyncResultComplete<{}>) => void,
        error?: (error: any) => void,
    }) {
        const remoteDb = new PouchDB('http://localhost:5984/mindful-db-1', {
            skip_setup: true,
            auth: {
                password: 'admin',
                username: 'admin'
            }
        });

        return this.doWork(async w => {
            const sync = w.sync(remoteDb, {
                live: true,
                retry: true
            }).on('change', (info) => {
                console.log('change', info);
                // handle change
                if (callbacks?.change) {
                    callbacks.change(info)
                }
            }).on('paused', (err) => {
                // replication paused (e.g. replication up to date, user went offline)
                if (callbacks?.paused) {
                    callbacks.paused(err)
                }
            }).on('active', function () {
                // replicate resumed (e.g. new changes replicating, user went back online)
                console.log('sync active');
                if (callbacks?.active) {
                    callbacks.active()
                }
            }).on('denied', function (err) {
                // a document failed to replicate (e.g. due to permissions)
                console.log('sync denied', err);
                if (callbacks?.denied) {
                    callbacks.denied(err)
                }
            }).on('complete', function (info) {

                // handle complete
                console.log('sync complete', info);
                if (callbacks?.complete) {
                    callbacks.complete(info)
                }
            }).on('error', function (err) {
                // handle error
                console.log('sync error', err);
                if (callbacks?.error) {
                    callbacks.error(err)
                }
            });

            return {
                cancel: sync.cancel,
            }
        });
    }

    protected createDb() {
        const db = window.api.db();
        return db;
    }

    notifications = this.dbset<INotification>(MindfulDocumentTypes.Notifications).keys(w => w.auto()).create();
    pages = this.dbset<IPage>(MindfulDocumentTypes.Pages).map({ property: "content", map: { deserialize: (v, e) => parse(e), serialize: (v, e) => stringify(e) } }).keys(w => w.auto()).create();
    sections = this.dbset<ISection>(MindfulDocumentTypes.Sections).keys(w => w.auto()).create();
}

export type MindfulDataContextFactory = (options?: DataContextOptions) => MindfulDataContext;

export const dbContextFactory: MindfulDataContextFactory = (options: DataContextOptions = {}): MindfulDataContext => {
    return new MindfulDataContext();
}