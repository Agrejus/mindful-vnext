import React from 'react';
import { SketchPicker } from 'react-color';
import './ChangeSectionColorModal.scss';
import { ButtonType, Modal } from './Modal';
import { ISection } from '../../data-access/entities/Section';

interface State {
    color: string;
}

interface Props {
    onSuccess: (section: ISection) => void;
    onCancel: () => void;
    section: ISection;
}

export class ChangeSectionColorModal extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            color: props.section.color
        }
    }

    onHandleSectionClick = async (button: ButtonType) => {
        if (button === "Ok") {
            const section = { ...this.props.section, color: this.state.color }
            this.props.onSuccess(section);
            return;
        }

        this.props.onCancel();
    }

    onChange = (hex: string) => {
        this.setState({ color: hex })
    }

    render() {
        return <Modal<ISection>
            buttons={["Ok", "Cancel"]}
            onClick={this.onHandleSectionClick}
            title="Change Section Color">
            <div>

                <SketchPicker
                    color={this.state.color}
                    onChange={e => this.onChange(e.hex)}
                    onChangeComplete={e => this.setState({ color: e.hex })}
                />
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, margin: 10 }}>Color</div>
                    <div style={{ backgroundColor: this.state.color, height: 40, width: "100%", borderRadius: 5, margin: "0 auto" }}></div>
                </div>
            </div>
        </Modal>
    }
}