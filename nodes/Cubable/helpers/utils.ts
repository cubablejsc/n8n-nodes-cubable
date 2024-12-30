import type {
    IDataObject,
    INodeExecutionData,
} from 'n8n-workflow';

export function flattenRecordCustomFields( record: IDataObject ) {
    const { customFields, ...rest } = record;

    return { ...rest, ...( customFields as IDataObject ) };
}

export function removeIgnoredFields(
    data: IDataObject,
    ignoreFields: string | string[]
) {
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

export function wrapData(
    data: IDataObject | IDataObject[]
): INodeExecutionData[] {
	return Array.isArray( data )
        ? data.map(( item: IDataObject ) => ({ json: item }))
        : [{ json: data }];
}
