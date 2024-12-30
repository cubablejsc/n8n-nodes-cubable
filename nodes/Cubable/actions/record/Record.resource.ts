import {
	type INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';

import { baseRLC, tableRLC } from '../common.description';

import * as create from './create.operation';
import * as deleteRecord from './delete.operation';
import * as get from './get.operation';
import * as search from './search.operation';
import * as update from './update.operation';

const properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new record in a table',
				action: 'Create a new record in a table',
			},
			// {
			// 	name: 'Create or update',
			// 	value: 'upsert',
			// 	description: 'Create a new record, or update the current one if it already exists (upsert)',
			// },
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
		default: 'create',
		noDataExpression: true,
		required: true,
	},
	baseRLC,
	tableRLC,
	...create.description,
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

export { create, deleteRecord, get, search, update };
