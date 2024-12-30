import type {
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';

export function wait( delayTime: number ) {
	// @ts-ignore
	return new Promise( resolve => setTimeout( resolve, delayTime ) );
}

export function flattenRecordCustomFields( record: IDataObject ): IDataObject {
	const { customFields, ...rest } = record;

	return { ...rest, ...( customFields as IDataObject ) };
}

export function removeIgnoredFields(
	data: IDataObject,
	ignoreFields: string | string[]
): IDataObject {
	if ( ignoreFields ) {
		const newData: IDataObject = {};

		for ( const field of Object.keys( data ) ) {
			if ( !ignoreFields.includes( field ) ) {
				newData[ field ] = data[ field ];
			}
		}

		return newData;
	}

	return data;
}

export async function batchExecute(
	fn: Function,
	idx: number,
	length: number,
	maxBatchSize: number = 20,
	delayTime: number = 1000
) {
	if ( ( idx + 1 ) < length && ( idx + 1 ) % maxBatchSize !== 0 ) return;

	await fn();
	await wait( delayTime );
}

export function wrapData(
	data: IDataObject | IDataObject[]
): INodeExecutionData[] {
	return Array.isArray( data )
		? data.map(( item: IDataObject ) => ({ json: item }))
		: [{ json: data }];
}
