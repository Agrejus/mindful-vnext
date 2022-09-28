import React, { useState } from 'react';
import { getDisplayName, render } from '../../../../shared-components/editors';
import { allWidgets, isAllowed } from '../../../../widgets/section-widget';
import { AddWidgetModal } from '../../../../shared-components/modal/AddWidgetModal';
import { HoverExpandButton } from '../../../../shared-components/buttons/HoverExpandButton';
import moment from 'moment';
import { ISection } from '../../../../data-access/entities/Section';
import { IPage } from '../../../../data-access/entities/Page';

interface IContentProps {
    onChange: (content: any) => void;
    page: IPage;
    section: ISection;
}

export const Content: React.FunctionComponent<IContentProps> = (props) => {
    const [isWdigetModalVisible, setIsWdigetModalVisible] = useState(false);
    const { onChange, page, section } = props;

    const onAddWidgetClick = () => {
        setIsWdigetModalVisible(true);
    }

    const areWidgetsAvailable = allWidgets.some(w => isAllowed(w.type, page.pageType));
    const icon = section?.widgets != null && section.widgets.length > 0 ? "bi bi-app-indicator" : "bi bi-app";
    const pageTitlePrefix = getDisplayName(page.pageType);

    return <div className="page-content-pane">
        {!!page.pageName && <div className="page-content-pane-title">
            <div className="page-header-actions-container">
                <HoverExpandButton className="text-default" text="share" iconClassName="fas fa-user-plus" />
                {areWidgetsAvailable && <HoverExpandButton onClick={onAddWidgetClick} className="text-default" text="widgets" iconClassName={icon} />}
            </div>
            <h4>{page.pageName}</h4>
            <small>{moment(page.createDateTime).format('dddd, MMMM Do YYYY, h:mm A')}</small>
            <hr />
        </div>}
        {render(page.pageType, {
            content: page.content,
            onChange: onChange
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