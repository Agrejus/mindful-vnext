import moment from 'moment';
import { debounce, sort, throttle } from 'radash';
import React, { useEffect, useState } from 'react';
import { ISection } from '../../data-access/entities/Section';
import { MindfulDataContextFactory } from '../../data-access/MindfulDataContext';
import { useMindfulDataContext } from '../../providers/MindfulDataContextProvider';
import { PageContainer } from './PageContainer';

interface ISectionContainerProps {

}

export const updateSectionsDebounced = debounce({ delay: 750 }, throttle({ interval: 750 }, async (dbContextFactory: MindfulDataContextFactory, sections: ISection[], done: () => void) => {
    console.log('updateSectionsDebounced')
    const context = dbContextFactory();

    const s = performance.now()
    const linked = await context.sections.link(...sections);
    await context.sections.markDirty(...linked);
    //await context.sections.upsert(...sections);
    await context.saveChanges();
    const e = performance.now();
    console.log('updateSectionsDebounced', e - s);
    done();
}));


export const SectionContainer: React.FC<ISectionContainerProps> = (props) => {

    const { children } = props;
    const [sections, setSections] = useState<ISection[]>([]);
    const [selectedSection, setSelectedSection] = useState<ISection | undefined>(undefined);

    const dbContextFactory = useMindfulDataContext();

    useEffect(() => {

        const setup = async () => {
            const context = dbContextFactory();
            const allSections = await context.sections.all();
            const section = allSections.find(w => w.isSelected === true);

            setSections(sort(allSections, w => w.order, false));
            setSelectedSection(section);

            console.log('sections setup')
            if (section) {

                // setSelectedSection(section);
                // const allPages = await context.pages.filter(w => w.sectionId === section._id);
                // setPages(DataSource.fromArray("_id", allPages));

                // const page = allPages.find(w => w.isSelected === true);

                // if (page) {
                //     setSelectedPage({ ...page });
                // }
            }
        }

        setup();

    }, [])

    
    const onSectionChanges = async (changes: ISection[]) => {

        const cloned = [...changes]

        setSections(cloned)

        updateSectionsDebounced(dbContextFactory, cloned, () => { })
    }

    const onSectionChange = async (change: ISection) => {

        const index = sections.findIndex(w => w._id === change._id);
        const clonedSections = [...sections]
        const clonedChange = { ...change }

        if (index !== -1) {
            clonedSections[index] = clonedChange
        }

        setSections(clonedSections);

        if (selectedSection?._id === change._id) {
            setSelectedSection(clonedChange)
        }

        updateSectionsDebounced(dbContextFactory, [clonedChange], () => { })
    }

    const onSectionDelete = async (id: string) => {

        const context = dbContextFactory();

        const allPages = await context.pages.filter(w => w.sectionId === id);
        await context.sections.remove(id);
        await context.pages.remove(...allPages);

        await context.saveChanges();

        const allSections = await context.sections.all();

        if (selectedSection?._id === id) {
            setSelectedSection(undefined);
        }

        setSections(allSections);

        return selectedSection;
    }

    const onSectionCreate = async (name: string) => {
        const context = dbContextFactory();
        const clonedSections = [...sections]
        for (let item of clonedSections) {
            item.isSelected = false;
        }

        const [newSection] = await context.sections.add({
            sectionName: name,
            isDisabled: false,
            color: "green",
            order: -1,
            createDateTime: moment().format(),
            isSelected: true,
            widgets: [],
            isArchived: false,
            settings: {},
            treeRoot: null
        });

        const linkedData = await context.sections.link(...clonedSections);
        await context.sections.markDirty(...linkedData);

        await context.saveChanges();

        setSelectedSection(newSection);
        setSections(sort([...clonedSections, newSection], w => w.order, false))
    }

    const onSectionSelect = async (id: string) => {
        const clonedSections = [...sections];
        let index = -1;
        clonedSections.forEach((w, i) => {
            if (w._id === id) {
                w.isSelected = true
                index = i
                return;
            }

            w.isSelected = false
        });

        setSections(clonedSections);
        updateSectionsDebounced(dbContextFactory, clonedSections, () => { });

        if (index != -1) {

            const section: ISection = { ...clonedSections[index] };
            setSelectedSection(section);
        }
    }

    return <PageContainer
        sections={sections}
        onSectionChange={onSectionChange}
        onSectionChanges={onSectionChanges}
        onSectionCreate={onSectionCreate}
        onSectionDelete={onSectionDelete}
        onSectionSelect={onSectionSelect}
        selectedSection={selectedSection}
    >{children}</PageContainer>
}