import React from 'react';

interface ISearchProps {
    searchText: string;
}

export const Search: React.FunctionComponent<ISearchProps> = (props) => {
    const { searchText } = props;

    if (searchText.length <= 2) {
        return null;
    }

    return null;
    // return <SearchResultRenderer
    //     documents={[]}
    //     goToPageFromSearch={this.goToPageFromSearch}
    //     goToSectionFromSearch={this.goToSectionFromSearch}
    //     searchText={this.state.searchText}
    //     allSections={[]}
    // />
}