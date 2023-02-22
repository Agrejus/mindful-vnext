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

    async saveChanges() {
        console.log('saveChanges');
        return super.saveChanges();
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
        const remoteDb = new PouchDB('https://wandering-resonance-42623.pktriot.net/mindful-v1', {
            skip_setup: true,
            auth: {
                username: "admin",
                password: "9EUXfpyEiMFUhQtAGVkyi0thh4QTmG"
            }
            // fetch: (url, options) => {
            //     // if (options?.method === "POST" || options?.method === "PUT") {

            //     //     if (options?.headers && options?.body) {

            //     //         const zippedBody = pako.gzip(options.body as any);
            //     //         const request = new Request(url, { ...options, body: zippedBody }) as Request;

            //     //         request.headers.append('Content-Encoding', 'gzip');

            //     //         return fetch(request)
            //     //     }
            //     // }

            //     const request = new Request(url, options) as Request;
            //     request.headers.append('Authorization', `Basic ${Buffer.from("admin:admin").toString('base64')}`);

            //     return fetch(request);
            // }
        });

        const options: PouchDB.Replication.ReplicateOptions & {
            style: "main_only"
        } = {
            style: "main_only",
            live: true,
            retry: true,
            checkpoint: "source",
            batch_size: 100,
            batches_limit: 10,
            timeout: 30000,
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
        }

        return this.doWork(async w => {
            const sync = w.sync(remoteDb, options).on('change', (info) => {
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
        if (window.NodePouchDB && this._dbOptions?.adapter !== "worker") {
            const dbPath = (window as any).dbPath;
            const opts = Object.assign(
                {},
                {
                    revs_limit: 10,
                },
                this._dbOptions
            );
            return new window.NodePouchDB(dbPath, opts);
        }

        const dbName = this._dbOptions?.name ?? "mindful-v1";
        const opts = Object.assign(
            {},
            {
                revs_limit: 10,
            },
            this._dbOptions
        );
        return new PouchDB(dbName, opts);
    }

    notifications = this.dbset<INotification>(MindfulDocumentTypes.Notifications).keys(w => w.auto()).create();
    pages = this.dbset<IPage>(MindfulDocumentTypes.Pages).keys(w => w.auto()).create();
    sections = this.dbset<ISection>(MindfulDocumentTypes.Sections).keys(w => w.auto()).create();
}

export type MindfulDataContextFactory = (options?: DataContextOptions) => MindfulDataContext;

export const dbContextFactory: MindfulDataContextFactory = (options: DataContextOptions = {}): MindfulDataContext => {
    return new MindfulDataContext();
}