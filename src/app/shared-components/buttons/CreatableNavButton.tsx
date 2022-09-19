import React from 'react';
import './CreatableNavButton.scss';

interface Props {
    onSave: (name: string) => void;
    color?: string;
    defaultText?: string;
}

interface State {
    name: string;
}

export class CreatableNavButton extends React.Component<Props, State> {

    input: HTMLInputElement | null = null;

    constructor(props: Props) {
        super(props);

        this.state = {
            name: props.defaultText || "New"
        }
    }

    componentDidMount() {

        if (this.input != null) {
            this.input.focus();
        }

    }

    onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.which === 13) {
            e.preventDefault();
            this.props.onSave(this.state.name);
            return;
        }
    }

    render() {
        let additionalClassNames = ['nav-button', 'nav-button-creatable'];

        const css: React.CSSProperties = {
            backgroundColor: this.props.color,
            position: "absolute",
            width: "10px",
            top: 0,
            bottom: 0,
            left: 0,
            borderTopLeftRadius: "5px",
            borderBottomLeftRadius: "5px"
        }

        const style = {
            cursor: "pointer"
        }
        const className = additionalClassNames.join(' ');

        return <div className={className} onBlur={() => this.props.onSave(this.state.name)} style={{
            ...style
        }}>
            {!!this.props.color && <React.Fragment><span style={css}></span></React.Fragment>}
            <input ref={e => this.input = e} onKeyDown={this.onKeyDown} className="creatable-nav-button-value" value={this.state.name} type="text" onChange={e => this.setState({ name: e.target.value })} />
        </div>
    }
}