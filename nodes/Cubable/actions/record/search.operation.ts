import {
	type INodeProperties,
	updateDisplayOptions
} from 'n8n-workflow';

import { getRecordFormatResults } from '../common.description';

export const properties: INodeProperties[] = [
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
