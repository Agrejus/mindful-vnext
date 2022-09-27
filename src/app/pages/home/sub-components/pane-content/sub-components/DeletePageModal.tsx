import React, { useState } from 'react';
import { IPage } from '../../../../../data-access/entities/Page';

interface Props {
    onClose: () => void;
    onDelete: (pageIds: string[]) => void;
    all: IPage[];
    page: IPage;
}

export const DeletePageModal: React.FunctionComponent<Props> = (props) => {

    const { onClose, page, onDelete, all } = props;
    const [value, setValue] = useState<string>('');
    const [checked, setChecked] = useState<boolean>(false);

    const children = all.filter(w => w._id !== page._id && w.path.includes(page._id));

    const handleDelete = () => {
        const pageIds = [page._id];

        if (checked === true) {
            pageIds.push(...children.map(w => w._id))
        }

        onDelete(pageIds)
    }

    // what do we do when children are deeper than the second level

    return <div className="modal" tabIndex={-1}>
        <div className="modal-dialog add-widget-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Delete Page</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-12">
                            <p>Are you sure you want to delete <strong>{page.title}</strong>?</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <small>Please type <strong>{page.title}</strong> to confirm?</small>
                            <input className='form-control' type="text" value={value} onChange={e => setValue(e.target.value)} />
                        </div>
                    </div>
                    {children.length > 0 && <div className="row">
                        <div className="col-md-12">
                            <input className='form-check-input' type="checkbox" disabled={value != page.title} checked={checked} onChange={e => setChecked(e.target.checked)} id="delete-page-modal-children-confirm" />
                            <label className="form-check-label" style={{ marginLeft: 45, display: 'inline-block', marginTop: 11 }} htmlFor="delete-page-modal-children-confirm">Delete child pages?</label>
                        </div>
                    </div>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-danger pull-left" onClick={onClose}>Cancel</button>
                    <button className="btn btn-outline-success pull-right" disabled={value != page.title} onClick={handleDelete}>{checked ? "Delete with children" : "Delete"}</button>
                </div>
            </div>
        </div>
    </div>
}