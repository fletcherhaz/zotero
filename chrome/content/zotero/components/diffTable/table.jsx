/*
    ***** BEGIN LICENSE BLOCK *****
    
    Copyright © 2020 Corporation for Digital Scholarship
                     Vienna, Virginia, USA
                     https://www.zotero.org
    
    This file is part of Zotero.
    
    Zotero is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Zotero is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
    
    ***** END LICENSE BLOCK *****
*/

import React, { useState, useImperativeHandle } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
	IconTick,
	IconCross,
	IconArrowRotateAnimated,
	IconWarning,
	IconBulletBlueEmpty
} from '../icons';

import Field from './field';

const Table = React.forwardRef((props, ref) => {
	const [rows, setRows] = useState([]);

	useImperativeHandle(ref, () => ({
		setRows
	}));

	function handleFieldToggle(itemID, fieldName) {
		props.onToggle(itemID, fieldName);
	}

	function handleMouseDown(event) {
		if (!event.target.closest('.value')) {
			let win = event.target.ownerDocument.defaultView;
			win.getSelection().removeAllRanges();
		}
	}

	return (
		<div className="diff-table" onMouseDown={handleMouseDown}>
			<div className="body">
				{rows.map((row) => {
					let numberOfPendingChanges = 0;
					let numberOfAppliedChanges = 0;
					let numberOfDisabledChanges = 0;

					for (let field of row.fields) {
						if (field.isApplied) {
							numberOfAppliedChanges += 1;
						}
						else if (field.isDisabled) {
							numberOfDisabledChanges += 1;
						}
						else {
							numberOfPendingChanges += 1;
						}
					}

					// We are done if there are no fields or all changes have been applied
					const isDone = !row.fields.length || numberOfAppliedChanges === row.fields.length;

					return (<div key={row.itemID} className="row">
						<div className="right fields-view">
							<div className="header" onDoubleClick={() => props.onDoubleClick(row.itemID)}>
								{row.status === Zotero.UpdateMetadata.ROW_SUCCEEDED && row.fields.length && <IconWarning/>
								|| row.status === Zotero.UpdateMetadata.ROW_SUCCEEDED && isDone && <IconTick/>
								|| row.status === Zotero.UpdateMetadata.ROW_PROCESSING && <IconArrowRotateAnimated/>
								|| row.status === Zotero.UpdateMetadata.ROW_FAILED && <IconCross/>
								|| <IconBulletBlueEmpty/>}
								<div className="title">{row.title}</div>
							</div>
							{row.message && <div className="message">{row.message}</div>}
							{row.isOpen && (
								<div className="fields">
									{row.fields.map(field => (
										<Field
											key={field.fieldName}
											itemID={row.itemID}
											field={field}
											onToggle={handleFieldToggle}
										/>
									))}
								</div>
							)}
							{!row.isOpen && row.fields.length > 0 && (
								<div className="fields-closed">
									<div className="summary">
										<span className="pending">
											{numberOfPendingChanges > 1 && (
												Zotero.getString('updateMetadata.pendingChanges.plural', numberOfPendingChanges)
											)}
											{numberOfPendingChanges === 1 && (
												Zotero.getString('updateMetadata.pendingChanges', numberOfPendingChanges)
											)}
											{numberOfPendingChanges > 0 && numberOfAppliedChanges > 0 || numberOfDisabledChanges > 0 ? ', ' : ''}
										</span>
										{numberOfAppliedChanges > 1 && (
											Zotero.getString('updateMetadata.appliedChanges.plural', numberOfAppliedChanges)
										)}
										{numberOfAppliedChanges === 1 && (
											Zotero.getString('updateMetadata.appliedChanges', numberOfAppliedChanges)
										)}
										{numberOfAppliedChanges > 0 && numberOfDisabledChanges > 0 ? ', ' : ''}
										{numberOfDisabledChanges > 1 && (
											Zotero.getString('updateMetadata.ignoredChanges.plural', numberOfDisabledChanges)
										)}
										{numberOfDisabledChanges === 1 && (
											Zotero.getString('updateMetadata.ignoredChanges', numberOfDisabledChanges)
										)}
									</div>
									<button
										className="show-button"
										onClick={() => props.onOpen(row.itemID)}
									>
										<FormattedMessage id="zotero.general.show"/>
									</button>
								</div>
							)}
							{row.status === Zotero.UpdateMetadata.ROW_SUCCEEDED && row.isOpen && row.fields.length > 0 && (
								<div className="footer">
									{!isDone && (
										<button
											className="toggle-button"
											onClick={() => props.onToggle(row.itemID)}>
											<FormattedMessage
												id={numberOfPendingChanges ? 'zotero.general.deselectAll' : 'zotero.general.selectAll'}
											/>
										</button>
									)}
									<div className="spacer"></div>
									{numberOfPendingChanges > 0 && (
										<button
											className="apply-button"
											default={true}
											onClick={() => props.onApply(row.itemID)}
										>
											<FormattedMessage id="zotero.general.apply"/>
										</button>
									)}
									<button
										className="hide-button"
										onClick={() => props.onDone(row.itemID)}
									>
										<FormattedMessage id="zotero.general.hide"/>
									</button>
								</div>
							)}
							<div className="separator"></div>
						</div>
					</div>);
				})}
			</div>
		</div>
	);
});

Table.propTypes = {
	onToggle: PropTypes.func,
	onApply: PropTypes.func,
	onDone: PropTypes.func,
	onOpen: PropTypes.func,
	onDoubleClick: PropTypes.func
};

export default Table;
