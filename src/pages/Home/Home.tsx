import { Component } from 'solid-js';
import { ContentToolbar } from './sub-components/ContentToolbar/ContentToolbar';

export const Home: Component = () => {

    return <>
        <div>
            <ContentToolbar />
        </div>
        <div class="page-container" id="home-page-container">
         {/* splitter https://split.js.org/#/split-grid?rows=2&columns=3 */}
        </div>
    </>
}