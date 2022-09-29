import { debounce, throttle } from 'radash';
import { IPage } from '../app/data-access/entities/Page';
import { MindfulDataContextFactory } from '../app/data-access/MindfulDataContext';


type PageUpdater = (id: string, dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => void
const updaters: { [key: string]: PageUpdater } = {};

export const queuePageChange: PageUpdater = (key: string, dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => {

    const id = `${key}-${pages.map(w => w._id).join("_")}`;
    console.log('queueing', key)

    if (!updaters[id]) {
        updaters[id] = debounce({ delay: 600 }, throttle({ interval: 600 }, async (id: string, dbContextFactory: MindfulDataContextFactory, pages: IPage[], done: () => void) => {
            const context = dbContextFactory();

            const s = performance.now()
            const linked = await context.pages.link(...pages.map(w => {
                delete w.title;
                return w;
            }));

            await context.pages.markDirty(...linked);
            await context.saveChanges();
            const e = performance.now();
            console.log('updatePagesDebounced', e - s)
            delete updaters[id];

            console.log(`${id} done`, updaters)
            done();
        }));
    }

    updaters[id](id, dbContextFactory, pages, done)
}