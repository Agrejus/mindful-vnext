export class DataSource<T extends {}> {

    private readonly _data: { [key in keyof T]: T } = {} as any
    private readonly _id: keyof T;

    constructor(id: keyof T, data?: { [key in keyof T]: T }) {
        this._id = id;

        if (data) {
            this._data = data;
        }
    }

    static fromArray<T extends {}>(id: keyof T, data: T[]) {
        const d = data.reduce((a, v) => {
            const key = v[id] as keyof T;
            return { ...a, [key]: v }
        }, {} as { [key in keyof T]: T });
        return new DataSource<T>(id, { ...d });
    }

    forEach(callback: (item: T) => void) {
        this.all().forEach(callback);
    }

    push(entity: T) {
        const id = entity[this._id] as keyof T;
        this._data[id] = entity
    }

    get length() {
        return Object.keys(this._data).length
    }

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any) {
        return this.all().map(callbackfn, thisArg);
    }

    filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any) {
        const data = this.all();
        return data.filter(predicate, thisArg);
    }

    find(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any) {
        const data = this.all();
        return data.find(predicate, thisArg);
    }

    get(id: string): T {
        return (this._data as any)[id]
    }

    all() {
        return Object.values<T>(this._data);
    }

    shallow() {
        const copy = Object.keys(this._data).reduce((a, v) => ({ ...a, [v]: { ...(this._data as any)[v] } }), {} as { [key in keyof T]: T })
        return new DataSource<T>(this._id, copy);
    }

    clone() {
        const data = JSON.parse(JSON.stringify(this._data)) as { [key in keyof T]: T };
        return new DataSource<T>(this._id, data);
    }

    many(ids: string[]) {
        return ids.map(w => this.get(w));
    }

    set(entity: T) {
        const key = entity[this._id] as keyof T;

        if (!this._data[key]) {
            return false;
        }

        this._data[key] = entity

        return true;
    }
}