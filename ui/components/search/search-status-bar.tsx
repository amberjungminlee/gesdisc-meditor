import Alert from 'react-bootstrap/Alert'
import { useQuery } from '@apollo/react-hooks'
import styles from './search-status-bar.module.css'
import Button from 'react-bootstrap/Button'
import { MdAdd } from 'react-icons/md'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../lib/apollo'
import { useContext } from 'react'
import { AppContext } from '../app-store'
import pickby from 'lodash.pickby'
import SearchFilter from './search-filter'

const QUERY = gql`
    query getModel($modelName: String!) {
        model(modelName: $modelName) {
            name
            workflow {
                currentNode {
                    privileges {
                        role
                        privilege
                    }
                }
                currentEdges {
                    role
                    label
                }
            }
        }
    }
`

const SearchStatusBar = ({
    model,
    currentPage,
    itemsPerPage,
    totalDocumentCount = 0,
    onAddNew,
    documentStates = [],
    user,
}) => {
    const offset = currentPage * itemsPerPage
    const router = useRouter()
    const { modelName } = router.query

    const { filterBy, setFilterBy } = useContext(AppContext)

    const { error, data } = useQuery(QUERY, {
        variables: { modelName },
        fetchPolicy: 'cache-and-network',
    })

    const schema = JSON.parse(model?.schema || '{}')
    const layout = JSON.parse(model?.uiSchema || model?.layout || '{}')

    // find fields in the layout that are marked as filters
    let filterFields = pickby(layout, field => 'ui:filter' in field)

    // retrieve the schema information for the field
    Object.keys(filterFields).forEach(field => {
        filterFields[field].schema = schema?.properties?.[field]
    })

    console.log('filter fields ', filterFields)

    const currentPrivileges = data?.model?.workflow ? user.privilegesForModelAndWorkflowNode(modelName, data.model.workflow.currentNode) : []
    const currentEdges = data?.model?.workflow?.currentEdges?.filter(edge => {
        return user.rolesForModel(modelName).includes(edge.role)
    }) || []

    if (error) {
        // something went wrong, but there's nowhere to show the error, log it
        console.error(error)
    }

    if (!totalDocumentCount) {
        return (
            <Alert variant="info">
                No documents found.

                {(currentPrivileges.includes('create') && currentEdges.length) && (
                    <Button variant="secondary" onClick={onAddNew} style={{ marginLeft: 20 }}>
                        <MdAdd />
                        {currentEdges[0].label}
                    </Button>
                )}
            </Alert>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.count}>
                Showing {offset + 1} - {(offset + itemsPerPage) > totalDocumentCount ? totalDocumentCount : offset + itemsPerPage} of {totalDocumentCount} {modelName} documents
            </div>

            <div className={styles.actions}>
                {Object.keys(filterFields).map(field => (
                    <SearchFilter key={field} label={field} field={filterFields[field]} />                    
                ))}

                <div className={styles.action}>
                    <label>
                        Filter by:
                        <select
                            className="form-control"
                            value={filterBy}
                            onChange={e => setFilterBy(e.target.value)}
                        >
                            <option value=""></option>

                            <optgroup label="State">
                                {documentStates.map(state => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </label>
                </div>

                {currentPrivileges.includes('create') && (
                    <div className={styles.action}>
                        {currentEdges.length && (
                            <Button variant="secondary" onClick={onAddNew}>
                                <MdAdd />
                                {currentEdges[0].label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default withApollo({ ssr: true })(SearchStatusBar)
