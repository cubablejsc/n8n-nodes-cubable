import {
	type INodeProperties,
	updateDisplayOptions
} from 'n8n-workflow';

import {
	getRecordFormatResults,
	viewRLC
} from '../common.description';

export const properties: INodeProperties[] = [
	viewRLC,
	...getRecordFormatResults,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operator: [ 'search' ],
		},
	},
	properties
);
