import React, { useState } from 'react';
import { Portal } from '../../shared-components/modal/Portal';
import { Pane } from '../../shared-components/panes/Pane';
import { SplitPane } from '../../shared-components/panes/SplitPane';
import { SplitterPaneProps } from '@progress/kendo-react-layout';
import { Sections } from './sub-components/pane-content/Sections';
import { Pages } from './sub-components/pane-content/Pages';
import { Content } from './sub-components/pane-content/Content';
import { SubHeader, ToolType } from './sub-components/SubHeader';
import { Search } from './sub-components/Search';
import './Home.scss';
import '../../../../node_modules/@progress/kendo-theme-default/dist/all.scss';
import { CSharpToTypescript } from '../../shared-components/tools/c-sharp-to-typescript/CSharpToTypescript';
import { JsonPrettyPrint } from '../../shared-components/tools/json-pretty-print/JsonPrettyPrint';

interface IHomeProps {

}

export const Home: React.FunctionComponent<IHomeProps> = (props) => {

    const [activeTool, setActiveTool] = useState<ToolType | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [showArchivedSections, setShowArchivedSections] = useState<boolean>(false);

    const panes: SplitterPaneProps[] = [
        { size: '220px', min: '125px', collapsible: true },
        { size: '250px', min: '150px', collapsible: true },
        { min: '100px', collapsible: true }
    ];

    const renderVisibleTool = () => {

        if (activeTool === "CSharpToTypescript") {
            return <CSharpToTypescript onClose={() => setActiveTool(null)} />
        }

        if (activeTool === "JsonPrettyPrint") {
            return <JsonPrettyPrint onClose={() => setActiveTool(null)} />
        }
        return null
    }

    return <React.Fragment>
        <div id="full-modal-portal"></div>
        <SubHeader
            onNavigateToTool={w => setActiveTool(w)}
            onToggleArchivedSections={() => setShowArchivedSections(w => !w)}
            searchText={searchText}
            onSearchTextChanged={setSearchText}
        />
        <div className="page-container" id="home-page-container">
            <Search searchText={searchText} />
            <SplitPane panes={panes} orientation="horizontal">
                <Pane className="sections-content-pane">
                    <Sections />
                </Pane>
                <Pane className="pages-content-pane">
                    <Pages />
                </Pane>
                <Pane>
                    <Content />
                </Pane>
            </SplitPane>
            {/* {this.state.changeColorSection && <ChangeSectionColorModal
                onClick={this.onChangeSectionColorHandler}
                onColorChange={this.onColorChange}
                color={this.state.changeColorSection.color}
            />}
            {this.state.selectedReminder && <ReminderModal
                reminder={this.state.selectedReminder}
                onClick={this.reminderHandler}
                onChange={e => this.setState({ selectedReminder: e })}
            />} */}
            <Portal id="full-modal-portal">
                {renderVisibleTool()}
            </Portal>
        </div>
    </React.Fragment>
}