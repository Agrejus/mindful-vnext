import React, { useEffect, useRef, useState } from 'react';
import './AddWidgetModal.scss';

interface IRenameModalProps {
    initialValue: string;
    onClose: () => void;
    onSave: (value: string) => void;
    title: string;
    inputHeader: string;
}

export const RenameModal: React.FC<IRenameModalProps> = (props) => {

    const { onClose, onSave, title, inputHeader, initialValue } = props;
    const [value, setValue] = useState<string>(initialValue);
    const inputElement = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (inputElement.current != null) {
            inputElement.current.focus();
        }
    }, []);
    
    const handleSave = () => {
        onSave(value);
        onClose();
    }

    const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.which === 13) {
            e.preventDefault();
            onSave(value);
            onClose();
            return;
        }
    }

    return <div className="modal" tabIndex={-1}>
        <div className="modal-dialog add-widget-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{title}</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-12">
                            <label className="full-width">{inputHeader}</label>
                            <input className="form-control" ref={inputElement} type="text" value={value} onKeyDown={onKeyDown} onChange={e => setValue(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-danger pull-left" onClick={onClose}>Cancel</button>
                    <button className="btn btn-outline-success pull-right" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    </div>
}