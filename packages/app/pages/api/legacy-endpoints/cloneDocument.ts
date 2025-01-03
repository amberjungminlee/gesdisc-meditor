import type { NextApiRequest, NextApiResponse } from 'next'
import cloneDocumentHandler from '../models/[modelName]/documents/[documentTitle]/clone-document'
import { baseDocumentSchema } from './_schemas'
import { z } from 'zod'
import { withApiErrorHandler } from 'lib/with-api-error-handler'

const schema = baseDocumentSchema
    .extend({
        newTitle: z.string().min(1).transform(encodeURIComponent),
    })
    .transform(({ model, title, newTitle }) => ({
        modelName: model,
        documentTitle: title,
        newTitle,
    }))

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // replaces query params with params mapped to RESTful names (e.g. "model" -> "modelName", etc.)
    req.query = schema.parse(req.query)

    return cloneDocumentHandler(req, res)
}

export default withApiErrorHandler(handler)
