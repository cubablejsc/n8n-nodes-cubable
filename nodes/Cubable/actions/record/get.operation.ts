import {
	type INodeProperties,
	updateDisplayOptions
} from 'n8n-workflow';

import { getRecordFormatResults } from '../common.description';

export const properties: INodeProperties[] = [
	{
		displayName: 'Record ID',
		name: 'recordID',
		type: 'string',
		placeholder: 'e.g. 01JFF58A8P4BJX07A1Y4KBTXJ3',
		default: '',
	},
	...getRecordFormatResults,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			operator: [ 'get' ],
		},
	},
	properties
);
