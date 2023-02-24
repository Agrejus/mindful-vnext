import * as React from 'react';
import ReactMde, { Suggestion, SaveImageHandler, Command } from "react-mde";
import * as Showdown from "showdown";
import './MarkdownEditor.scss';
import "../../../../../node_modules/react-mde/lib/styles/scss/react-mde-all.scss";
import '../../../external-modules/prism/prism.css';
import { Modal } from '../../modal/Modal';
import { EditorProps, IEditor, IEditorApi, ToolbarEditorProps } from '..';
import { IPage, PageType } from '../../../data-access/entities/Page';
import { forwardRef, PropsWithChildren, useEffect, useState } from 'react';
import { ILinksEditorApi } from '../links-editor/LinksEditor';
const Prism = require('../../../external-modules/prism/prism');

type TabTypes = "write" | "preview";

interface IMarkdownProps {
    tab: TabTypes;
    content: string;
}

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,

});

const MarkdownEditor = forwardRef<ILinksEditorApi, PropsWithChildren<EditorProps>>((props, ref) => {
    
    const { content, onChange } = props;
    const [isLanguagesModalVisible, setIsLanguagesModalVisible] = useState<boolean>(false)

    const markdownProps = content as IMarkdownProps;

    useEffect(() => {
        const elements = document.getElementsByClassName("mde-text");

        if (elements && elements.length > 0) {
            elements[0].addEventListener('keydown', (e: any) => {
                if (e.key == 'Tab') {
                    e.preventDefault();

                    var start = e.target.selectionStart;
                    var end = e.target.selectionEnd;

                    // set textarea value to: text before caret + tab + text after caret
                    e.target.value = e.target.value.substring(0, start) + "\t" + e.target.value.substring(end);

                    // put caret at right position again
                    e.target.selectionStart = e.target.selectionEnd = start + 1;

                    // make sure we save our changes
                    handleChange(e.target.value);
                }
            });
        }
    }, [])

    const onTabChange = (tab: TabTypes) => {
        const markdownProps = content as IMarkdownProps;
        markdownProps.tab = tab;
        onChange(markdownProps);
    }

    const save: SaveImageHandler = async function* (data: ArrayBuffer) {
        // Promise that waits for "time" milliseconds
        const wait = function (time: number) {
            return new Promise((a: any, r) => {
                setTimeout(() => a(), time);
            });
        };

        // Upload "data" to your server
        // Use XMLHttpRequest.send to send a FormData object containing
        // "data"
        // Check this question: https://stackoverflow.com/questions/18055422/how-to-receive-php-image-data-over-copy-n-paste-javascript-with-xmlhttprequest

        await wait(2000);
        // yields the URL that should be inserted in the markdown
        yield "https://picsum.photos/300";
        await wait(2000);

        // returns true meaning that the save was successful
        return true;
    }

    const handleChange = (value: string) => {
        const markdownProps = content as IMarkdownProps;
        markdownProps.content = value;
        onChange(markdownProps);
    }

    const highlight = (markdown: string) => {

        try {
            let html = converter.makeHtml(markdown);

            const matches = html.match(/<code[\s\S]*?<\/code>/g);
    
            if (matches) {
                matches?.forEach(w => {
    
                    const openingTagRegex = /<code(.)*?>/;
                    const innerHtml = w.replace("</code>", "").replace(openingTagRegex, "");
    
                    let language = "html";
                    const openingTagMatch = w.match(openingTagRegex);
    
                    if (openingTagMatch) {
                        const classNameMatch = openingTagMatch[0].match(/class="(.)*?"/);
    
                        if (classNameMatch) {
                            const classNames = classNameMatch[0].replace("class=\"", "").replace("\"", "");
                            language = classNames.split(' ')[0];
                        }
                    }
    
                    html = html.replace(innerHtml, Prism.highlight(innerHtml, Prism.languages[language], language))
                })
            }
    
            return decodeHtml(html);
        } catch (e) {
            return "MARKDOWN GENERATION ERROR";
        }
    }
    
    const decodeHtml = (html: string) => {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    const languagesCommand: Command = {
        icon: () => <span>Languages</span>,
        execute: ({ initialState, textApi }) => {
            setIsLanguagesModalVisible(true);
        }
    }

    return <>
        <ReactMde
            commands={{ "languages": languagesCommand }}
            classes={{ reactMde: "markdown-editor", toolbar: "editor-toolbar" }}
            toolbarCommands={[["languages", "bold", "italic"]]}
            value={markdownProps.content}
            onChange={handleChange}
            selectedTab={markdownProps.tab}
            onTabChange={onTabChange}
            generateMarkdownPreview={markdown =>
                Promise.resolve(highlight(markdown))
            }
            childProps={{
                writeButton: {
                    tabIndex: -1
                }
            }}
            paste={{
                saveImage: save
            }}
        />
        {isLanguagesModalVisible === true && <Modal
            buttons={["Ok"]}
            onClick={() => setIsLanguagesModalVisible(false)}
            title="Languages"
        >
            <ul>
                {
                    Object.keys(Prism.languages).sort().map(w => <li key={w}>{w}</li>)
                }
            </ul>
        </Modal>}
    </>
})

export const markdownEditor: IEditor<EditorProps, IEditorApi> = {
    stringifySearchContent: (content: IMarkdownProps) => content.content,
    getComponent: () => MarkdownEditor,
    renderToolbar :(props: ToolbarEditorProps) => <div>Toolbar</div>,
    getDefaultContent : () => ({ tab: "write", content: "" } as IMarkdownProps),

    parse : (page: IPage) => JSON.parse(page.content),
    stringify : (page: IPage) => JSON.stringify(page.content),
    type : PageType.Markdown,
    icon : "bi bi-markdown",
    displayName : "Markdown"
}