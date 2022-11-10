import type { APIError } from '../declarations'
import { ErrorData } from '../declarations'
import type { DocumentPublications } from './types'

async function fetchDocumentPublications(
    documentTitle: string,
    modelName: string
): Promise<ErrorData<DocumentPublications[]>> {
    try {
        const response = await fetch(
            `/meditor/api/models/${encodeURIComponent(
                modelName
            )}/documents/${encodeURIComponent(documentTitle)}/publications`
        )

        if (!response.ok) {
            const apiError: APIError = await response.json()

            return [apiError, null]
        }

        const publications = await response.json()

        return [null, publications]
    } catch (error) {
        return [error, null]
    }
}

export { fetchDocumentPublications }