import type {
	IExecuteFunctions,
	INodeExecutionData
} from 'n8n-workflow';

import * as record from './record/Record.resource';

export async function router( this: IExecuteFunctions ): Promise<INodeExecutionData[][]> {
	const items: INodeExecutionData[] = this.getInputData();
	const resource: string = this.getNodeParameter( 'resource', 0 );
	const operation: string = this.getNodeParameter( 'operation', 0 );

	let returnData: INodeExecutionData[] = [];

	switch ( resource ) {
		case 'record':
			const baseID: string = this.getNodeParameter( 'base', 0, undefined, {
				extractValue: true,
			} ) as string;
			const tableID: string = this.getNodeParameter( 'table', 0, undefined, {
				extractValue: true,
			} ) as string;

			returnData = await ( record as any )[ operation as any ].execute.call(
				this,
				items,
				baseID,
				tableID
			);
			break;
	}

	return [ returnData ];
}
