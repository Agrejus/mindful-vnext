/// <reference path="../../../config.d.ts" />
import { DataContext, DataContextOptions } from "pouchdb-entity-fabric"
import { parse, stringify } from "../shared-components/editors";
import { INotification } from "./entities/Notification"
import { IPage } from "./entities/Page";
import { ISection } from "./entities/Section";
import PouchDB from 'pouchdb';
import pako from "pako";

export enum MindfulDocumentTypes {
    Notifications = "Notifications",
    Pages = "Pages",
    Sections = "Sections",
}

export class MindfulDataContext extends DataContext<MindfulDocumentTypes> {

    protected async doWork<T>(action: (db: PouchDB.Database) => Promise<T>, shouldClose: boolean = true) {
        const db = this.createDb();
        const result = await action(db);

        // Closing the connection only makes sense for IndexedDb
        // https://github.com/pouchdb/pouchdb/issues/3429#issuecomment-71043588
        return result;
    }

    sync(callbacks?: {
        change?: (info: PouchDB.Replication.SyncResult<{}>) => void,
        paused?: (err: any) => void,
        active?: () => void,
        denied?: (err: any) => void,
        complete?: (info: PouchDB.Replication.SyncResultComplete<{}>) => void,
        error?: (error: any) => void,
    }) {
        let delay = 0;
        const remoteDb = new PouchDB('http://localhost:3000/mindful-db-1', {
            skip_setup: true,
            fetch: (url, options) => {
                // if (options?.method === "POST" || options?.method === "PUT") {

                //     if (options?.headers && options?.body) {

                //         const zippedBody = pako.gzip(options.body as any);
                //         const request = new Request(url, { ...options, body: zippedBody }) as Request;

                //         request.headers.append('Content-Encoding', 'gzip');

                //         return fetch(request)
                //     }
                // }

                const request = new Request(url, options) as Request;
                request.headers.append('Authorization', `Basic ${Buffer.from("admin:admin").toString('base64')}`);

                return fetch(request);
            }
        });

        return this.doWork(async w => {
            const sync = w.sync(remoteDb, {
                live: true,
                retry: true,
                checkpoint: "source",
                back_off_function: () => {
                    if (delay === 0) {
                        delay = 1000;
                        return 1000; // start with 1 second
                    }

                    if (delay < 10000) {
                        delay = delay * 1.2;
                        return delay; // increase a little bit at a time
                    }

                    delay = 10000;
                    return delay; // don't go over 10 seconds
                }
            }).on('change', (info) => {
                delay = 0;
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
                if (callbacks?.active) {
                    callbacks.active()
                }
            }).on('denied', function (err) {
                // a document failed to replicate (e.g. due to permissions)
                if (callbacks?.denied) {
                    callbacks.denied(err)
                }
            }).on('complete', function (info) {
                delay = 0;
                // handle complete
                if (callbacks?.complete) {
                    callbacks.complete(info)
                }
            }).on('error', function (err) {
                // handle error
                if (callbacks?.error) {
                    callbacks.error(err)
                }
            })

            return {
                cancel: sync.cancel
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