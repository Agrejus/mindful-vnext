import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMindfulDataContext } from "../providers/MindfulDataContextProvider";
import * as sectionReducer from '../redux/reducers/SectionReducer';
import * as pageReducer from '../redux/reducers/PageReducer';
import { ISection } from "../data-access/entities/Section";
import { IPage } from "../data-access/entities/Page";

interface ReduxStoreProps {

}

export const StoreConfigurator: React.FunctionComponent<ReduxStoreProps> = (props) => {

    const { children } = props;
    const dbContextFactory = useMindfulDataContext();
    const dispatch = useDispatch();

    const setSections = (sections: ISection[]) => dispatch(sectionReducer.setAll(sections));
    const setSelectedSection = (section: ISection) => dispatch(sectionReducer.setSelected(section));
    const setPages = (pages: IPage[]) => dispatch(pageReducer.setAll(pages));
    const setSelectedPage = (page: IPage) => dispatch(pageReducer.setSelected(page));

    useEffect(() => {

        const setup = async () => {
            const context = dbContextFactory();
            const allSections = await context.sections.all();
            const section = allSections.find(w => w.isSelected === true);

            setSections(allSections);

            if (section) {

                setSelectedSection(section);
                const allPages = await context.pages.filter(w => w.sectionId === section._id);
                setPages(allPages);

                const page = allPages.find(w => w.isSelected === true);

                if (page) {
                    setSelectedPage({ ...page });
                }
            }
        }

        setup();

    }, [])

    return <>
        {children}
    </>
}