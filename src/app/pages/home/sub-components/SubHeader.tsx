import React, { useState } from 'react';

interface ISubHeaderProps {
    onToggleArchivedSections: () => void;
    onNavigateToTool: (tool: ToolType) => void;
    searchText: string;
    onSearchTextChanged: (value:string) => void;
}

interface Navigation {
    sectionId: string;
    pageId?: string;
    isActive: boolean;
}

export type ToolType = "JsonPrettyPrint" | "CSharpToTypescript"


export const SubHeader: React.FunctionComponent<ISubHeaderProps> = (props) => {

    const {onToggleArchivedSections, onNavigateToTool, searchText, onSearchTextChanged} = props;
    const [navigationItems, setNavigationItems] = useState<Navigation[]>([]);

    const onBackClick = () => {
        const items = [...navigationItems];
        let currentIndex = items.findIndex(w => w.isActive === true);

        if (currentIndex === 0) {
            return;
        }

        items[currentIndex].isActive = false;
        currentIndex--;
        items[currentIndex].isActive = true;

        setNavigationItems(items);
    }

    const onForwardClick = () => {
        const items = [...navigationItems];
        let currentIndex = items.findIndex(w => w.isActive === true);

        if (currentIndex === (items.length - 1)) {
            return;
        }

        items[currentIndex].isActive = false;
        currentIndex++;
        items[currentIndex].isActive = true;

        setNavigationItems(items);
    }

    const canNavigateBack = navigationItems.length > 0 && navigationItems[0].isActive === false;
    const canNavigateForward = navigationItems.length > 0 && navigationItems[navigationItems.length - 1].isActive === false;
    return <>
        <div className="sub-header">
            <i className={`bi bi-caret-left-square clickable${canNavigateBack === false ? " icon-disabled" : ""}`} onClick={onBackClick}></i>
            <i className={`bi bi-caret-right-square clickable${canNavigateForward === false ? " icon-disabled" : ""}`} onClick={onForwardClick}></i>
            <i className="bi bi-arrow-counterclockwise clickable"></i>
            <i className="bi bi-arrow-clockwise clickable"></i>
            <span className="separator"></span>
            <span>Sections&emsp;</span>
            <i className="bi bi-archive-fill clickable" onClick={onToggleArchivedSections}></i>
            <span className="separator"></span>
            <i className="bi bi-braces clickable" onClick={() => onNavigateToTool("JsonPrettyPrint" )}></i>
            <i className="bi bi-arrow-left-right clickable" onClick={() => onNavigateToTool("CSharpToTypescript" )}></i>
            <input className="form-control pull-right" type="text" placeholder="Search..." value={searchText} onChange={e => onSearchTextChanged(e.target.value)} />
        </div>
    </>
}