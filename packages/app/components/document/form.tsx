import Button from 'react-bootstrap/Button'
import dynamic from 'next/dynamic'
import { useState } from 'react'

// JsonSchemaForm widgets rely heavily on global window, so we'll need to load them in separately
// as the server side doesn't have a window!
const JsonSchemaForm = dynamic(() => import('../jsonschemaform/jsonschemaform'), {
    ssr: false,
})

const Form = ({
    model,
    document,
    liveValidate = false,
    readOnly = false,
    onUpdateForm,
    allowValidationErrors = false,
    onChange = (data: any) => {},
}) => {
    const [expandAll, setExpandAll] = useState(false)
    const largeModel = model?.largeModel || false

    let layout = JSON.parse(model?.uiSchema || model?.layout || '{}')
    let formData = document?.doc || document || {}

    let hasSections = JSON.stringify(layout).indexOf('CollapsibleField') >= 0

    if (readOnly) {
        layout['ui:readonly'] = true
    }

    function toggleExpandAll() {
        let sectionsExpanded = !expandAll

        setExpandAll(sectionsExpanded)

        window.dispatchEvent(
            new CustomEvent(sectionsExpanded ? 'expandall' : 'collapseall')
        )
    }

    // ensure mEditor additional properties don't trigger validation errors
    const schema = model ? JSON.parse(model.schema) : {}
    schema.additionalProperties = true

    return (
        <>
            {hasSections && (
                <Button
                    variant="outline-secondary"
                    className="mt-4 mb-3"
                    onClick={toggleExpandAll}
                >
                    {expandAll ? 'Collapse All' : 'Expand All'}
                </Button>
            )}

            <JsonSchemaForm
                schema={schema}
                formData={formData}
                layout={layout}
                liveValidate={liveValidate}
                onInit={onUpdateForm}
                onChange={(event: any) => onChange(event?.formData)}
                imageUploadUrl={process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL}
                linkCheckerUrl="/meditor/api/validate/url-resolves"
                allowValidationErrors={allowValidationErrors}
                largeModel={largeModel}
            />
        </>
    )
}

export default Form
