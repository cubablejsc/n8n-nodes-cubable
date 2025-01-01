import type { INodeProperties } from 'n8n-workflow';

export const recordIDInput: INodeProperties = {
	displayName: 'Record ID',
	name: 'recordID',
	type: 'string',
	default: '',
	description: 'Unique identifier for the record to be retrieved or updated',
	placeholder: 'e.g. 01JFF58A8P4BJX07A1Y4KBTXJ3',
	required: true,
};

export const fetchAdvancedOptions: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	default: {},
	description: 'Additional options which decide which records should be returned',
	placeholder: 'Add option',
	options: [
		{
			// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options
			displayName: 'Output Custom Fields',
			name: 'outputCustomFields',
			type: 'multiOptions',
			typeOptions: {
				loadOptionsMethod: 'getFields',
				loadOptionsDependsOn: [ 'base.value', 'table.value' ],
			},
			default: [],
			// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
			description: 'The custom fields you want to include in the output',
		},
		{
			displayName: 'Expand Custom Fields',
			name: 'expandCustomFields',
			type: 'boolean',
			description: 'Whether to convert nested custom fields into a flat structure in the output',
			default: true,
		},
		{
			displayName: 'Return by Custom Field ID',
			name: 'returnCustomFieldsByFieldID',
			type: 'boolean',
			description: 'Whether to return custom fields by their field IDs in the output',
			default: true,
		},
	],
};

export const ignoreFieldsOnAutoMapInputData: INodeProperties = {
	displayName: 'Ignore Fields From Input',
	name: 'ignoreFields',
	type: 'multiOptions',
	default: [],
	// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
	description: 'Comma-separated list of fields in input to ignore when updating',
	displayOptions: {
		show: {
			'/fields.mappingMode': [ 'autoMapInputData' ],
		},
	},
	typeOptions: {
		loadOptionsMethod: 'getFields',
	},
};
