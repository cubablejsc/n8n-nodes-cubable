import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { authentication, credential } from './descriptions/authentication.description';
import { resource } from './descriptions/common.description';
import { listSearch, loadOptions, resourceMapping } from './methods';
import { router } from './actions/router';
import * as record from './actions/record/Record.resource';

export class Cubable implements INodeType {

	description: INodeTypeDescription = {
		displayName: 'Cubable',
		name: 'cubable',
		icon: 'file:cubable.svg',
		group: [ 'transform' ],
		version: 2,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Read, update, write and delete data from Cubable',
		defaults: { name: 'Cubable' },
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [ NodeConnectionType.Main ],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node, n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [ NodeConnectionType.Main ],
		credentials: [{ ...credential }],
		properties: [
			authentication,
			resource,
			...record.description,
		],
	};

	methods = { listSearch, loadOptions, resourceMapping };

	async execute( this: IExecuteFunctions ): Promise<INodeExecutionData[][]> {
		return await router.call( this );
	}

}
