import {
	type INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';

import { baseRLC, tableRLC } from '../../descriptions/common.description';

import * as create from './create.operation';
import * as upsert from './upsert.operation';
import * as deleteRecord from './deleteRecord.operation';
import * as get from './get.operation';
import * as search from './search.operation';
import * as update from './update.operation';

const properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'create',
		noDataExpression: true,
		required: true,
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new record in a table',
				action: 'Create a new record in a table',
			},
			{
				name: 'Create or Update',
				value: 'upsert',
				description: 'Create a new record, or update the current one if it already exists (upsert)',
				action: 'Create a new record or update in a table',
			},
			{
				name: 'Delete',
				value: 'deleteRecord',
				description: 'Delete a record from a table',
				action: 'Delete a record from a table',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a record from a table',
				action: 'Retrieve a record from a table',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for specific records or list all',
				action: 'Search for specific records or list all',
			},
			{
				name: 'Update',
				value: 'update', 
				description: 'Update a record in a table',
				action: 'Update a record in a table',
			},
		],
	},
	baseRLC,
	tableRLC,
	...create.description,
	...upsert.description,
	...deleteRecord.description,
	...get.description,
	...search.description,
	...update.description,
];

export const description: INodeProperties[] = updateDisplayOptions(
	{
		show: {
			resource: [ 'record' ],
		},
	},
	properties
);

export { create, upsert, deleteRecord, get, search, update };
