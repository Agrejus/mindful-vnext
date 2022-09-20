import React, { useState } from 'react';
import { getDisplayName, render } from '../../../../shared-components/editors';
import { allWidgets, isAllowed } from '../../../../widgets/section-widget';
import { AddWidgetModal } from '../../../../shared-components/modal/AddWidgetModal';
import { HoverExpandButton } from '../../../../shared-components/buttons/HoverExpandButton';
import * as pageActions from '../../../../redux/actions/PageActions';
import * as pageReducer from '../../../../redux/reducers/PageReducer';
import * as sectionReducer from '../../../../redux/reducers/SectionReducer';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
interface IContentProps {

}

export const Content: React.FunctionComponent<IContentProps> = (props) => {
    const [isWdigetModalVisible, setIsWdigetModalVisible] = useState(false);

    const section = useAppSelector(sectionReducer.getSelectedSection);
    const page = useAppSelector(pageReducer.getSelectedPage);
    const dispatch = useAppDispatch();
    const onContentChange = (content: any) => dispatch(pageActions.onContentChange(content));

    const onAddWidgetClick = () => {
        setIsWdigetModalVisible(true);
    }

    if (page == null || section == null) {
        return null;
    }

    const areWidgetsAvailable = allWidgets.some(w => isAllowed(w.type, page.pageTypeId));
    const icon = section?.widgets != null && section.widgets.length > 0 ? "bi bi-app-indicator" : "bi bi-app";
    const pageTitlePrefix = getDisplayName(page.pageTypeId);

    return <div className="page-content-pane">
        {!!page.pageName && <div className="page-content-pane-title">
            <div className="page-header-actions-container">
                <HoverExpandButton className="text-default" text="share" iconClassName="fas fa-user-plus" />
                {areWidgetsAvailable && <HoverExpandButton onClick={onAddWidgetClick} className="text-default" text="widgets" iconClassName={icon} />}
            </div>
            <h4>{page.pageName}</h4>
            <small>{moment(page.savedDateTime).format('dddd, MMMM Do YYYY, h:mm:ss A')}</small>
            <small>{moment(page.createDateTime).format('dddd, MMMM Do YYYY, h:mm A')}</small>
            <hr />
        </div>}
        {render(page.pageTypeId, {
            content: page.content,
            onChange: onContentChange
        })}
        {
            isWdigetModalVisible && section && <AddWidgetModal
                titlePrefix={pageTitlePrefix}
                onChange={() => void (0)}
                widgets={section.widgets}
                onClose={() => setIsWdigetModalVisible(false)}
            />
        }
    </div>
}