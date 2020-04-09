import { useContext, useState } from 'react'
import { AppContext } from '../../../components/app-store'
import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../../lib/apollo'
import Alert from 'react-bootstrap/Alert'
import RenderResponse from '../../../components/render-response'
import Loading from '../../../components/loading'
import PageTitle from '../../../components/page-title'
import Form from '../../../components/form'
import { Breadcrumbs, Breadcrumb } from '../../../components/breadcrumbs'
import DocumentHeader from '../../../components/document-header'
import mEditorApi from '../../../service/'
import withAuthentication from '../../../components/with-authentication'
import FormActions from '../../../components/form-actions'

const QUERY = gql`
    query getModel($modelName: String!) {
        model(modelName: $modelName) {
            name
            description
            icon {
                name
                color
            }
            schema
            layout
            titleProperty
            workflow {
                currentNode {
                    privileges {
                        role
                        privilege
                    }
                }
            }
        }
    }
`

const NewDocumentPage = ({ user }) => {
    const router = useRouter()
    const params = router.query
    const modelName = params.modelName as string

    const [form, setForm] = useState(null)
    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const { loading, error, data } = useQuery(QUERY, {
        variables: { modelName },
    })

    const currentPrivileges = data?.model?.workflow ? user.privilegesForModelAndWorkflowNode(modelName, data.model.workflow.currentNode) : []

    function redirectToDocumentEdit(document) {
        let documentName = encodeURIComponent(document[data.model.titleProperty])
        router.push('/[modelName]/[documentTitle]', `/${encodeURIComponent(modelName)}/${documentName}`)
    }

    async function createDocument(document) {
        document['x-meditor'] = {}
        document['x-meditor'].model = modelName

        let documentBlob = new Blob([JSON.stringify(document)])

        try {
            await mEditorApi.putDocument(documentBlob)

            setSuccessNotification('Successfully created the document')
            redirectToDocumentEdit(document)
        } catch (err) {
            console.error('Failed to create document ', err)
            setErrorNotification('Failed to create the document')
        }
    }

    return (
        <div>
            <PageTitle title={['Add New', modelName]} />

            <Breadcrumbs>
                <Breadcrumb title={modelName} href="/[modelName]" as={`/${modelName}`} />
                <Breadcrumb title="New" />
            </Breadcrumbs>

            <DocumentHeader model={data?.model} />

            <RenderResponse
                loading={loading}
                error={error}
                loadingComponent={<Loading text={`Loading...`} />}
                errorComponent={
                    <Alert variant="danger">
                        <p>Failed to load the page.</p>
                        <p>This is most likely temporary, please wait a bit and refresh the page.</p>
                        <p>If the error continues to occur, please open a support ticket.</p>
                    </Alert>
                }
            >
                <Form model={data?.model} onUpdateForm={setForm} />
                
                <FormActions  
                    privileges={currentPrivileges}
                    form={form} 
                    onSave={createDocument}
                />
            </RenderResponse>
        </div>
    )
}

export default withApollo({ ssr: true })(withAuthentication(NewDocumentPage))
