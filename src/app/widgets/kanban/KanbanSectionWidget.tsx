import React from 'React';
import { IPage, PageType } from '../../data-access/entities/Page';
import { IWidget, SectionWidgetType } from '../../data-access/entities/Section';
import { ISectionWidget, safeParse, safeStringify, SectionWidgetProps } from '../section-widget';

const icon = "bi bi-kanban";

const KanbanSectionWidgetItem: React.FunctionComponent<SectionWidgetProps> = (props) => {

    const data: number = props.data as number;

    return <div className="widget">
        <i className={`${icon} icon-md display-icon`}></i>
        <span className="badge badge-secondary">{data}</span>
    </div>
}

export class KanbanSectionWidget implements ISectionWidget {
    description = "Shows a count of all Kanban cards that are not in a completed status";
    availablePageTypes = [PageType.Kanban];
    name = "Kanban Not Completed";
    defaultValue = 0;
    render = (props: SectionWidgetProps, index: number) => {

        if (props.data == null || props.data == 0) {
            return null
        }

        return <KanbanSectionWidgetItem {...props} key={`section-widget-${index}`} />
    }
    type = SectionWidgetType.KanbanNonCompleted;
    icon = icon;
    parse = (widget: IWidget) => safeParse(widget.data);
    stringify = (widget: IWidget) => safeStringify(widget.data);
    onChange = (widget: IWidget, pages: Set<IPage>) => {

        // const foundPages = pages.filter(w => this.availablePageTypes.includes(w.pageTypeId));

        // if (foundPages.length === 0) {
        //     widget.data = null;
        //     return;
        // }

        // const boards = foundPages.map(w => w.content as IBoard).filter(w => w.cards != null && w.cards.length > 0);
        // const columns = boards.filter(w => w.columns != null && w.columns.length > 0).map(w => w.columns).reduce((a, b) => a.concat(b));
        // const allCards = boards.filter(w => w.cards != null && w.cards.length > 0).map(w => w.cards).reduce((a, b) => a.concat(b)).filter(w => !w.isArchived);
        // const progressColumnsIds = columns.filter(w => w.name.toLowerCase().includes("complete") === false).map(w => w.id);

        // widget.data = allCards.filter(w => progressColumnsIds.includes(w.columnId)).length;
    }
}