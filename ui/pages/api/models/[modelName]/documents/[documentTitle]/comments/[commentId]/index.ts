import { NextApiRequest, NextApiResponse } from 'next'
import { getCommentForDocument } from '../../../../../../../../comments/service'
import { apiError, NotFoundException } from '../../../../../../../../utils/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const { commentId, documentTitle, modelName } = req.query

                const [error, comment] = await getCommentForDocument(
                    decodeURIComponent(commentId.toString()),
                    decodeURIComponent(documentTitle.toString()),
                    decodeURIComponent(modelName.toString())
                )

                if (error || !Object.keys(comment).length) {
                    throw new NotFoundException(
                        `Comments not found for model '${modelName}' with document '${documentTitle}' and comment ID '${commentId}'.`
                    )
                }

                return res.status(200).json(comment)
            }

            default:
                return res.status(405).json({ message: 'Method Not Allowed' })
        }
    } catch (err) {
        return apiError(res, err)
    }
}