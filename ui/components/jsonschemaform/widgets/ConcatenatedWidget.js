import React, { useState, useEffect } from 'react'

const DEFAULT_DELIMETER = ' > '
const ID_PREFIX = 'root_'

function ConcatenatedWidget(props) {
    const { BaseInput } = props.registry.widgets

    const delimeter = props.options.delimeter || DEFAULT_DELIMETER

    const [concatenatedValue, setConcatenatedValue] = useState(props.value)

    // update our local store from the passed in value
    useEffect(() => setConcatenatedValue(props.value), [props.value])

    /**
     * finds a field's value
     * 
     * a field's value can be in one of 4 states (using 3rd party widgets so we can't enforce a specific standard):
     * - "foo": a plain string
     * - "{"label": "field label", "value": "foo"}": a JSON stringifed label/value
     * - {"label": "field label", "value": "foo"}: an object label/value
     * - [{"label": "field label", "value": "foo"}]: an array containing the same object
     * @param {*} field 
     */
    function getFieldValue(field) {
        let fieldValue
        
        try {
            // parse embedded JSON string
            fieldValue = JSON.parse(field.value)
        } catch(err) {
            // value is not JSON, grab it directly
            fieldValue = field.value
        }
  
        if (Array.isArray(fieldValue) && fieldValue.length) {
            // field value is an array so we'll need to grab the first item
            fieldValue = fieldValue[0]
        }

        if (typeof fieldValue === 'object' && 'value' in fieldValue) {
            // value is an object that contains a value property
            fieldValue = fieldValue.value
        }

        return fieldValue
    }

    /**
     * retrieves field values from the fields defined in ui:options
     * then concatenates them together and sets this field to that concatenated value
     */
    function updateConcatenatedFieldValueFromFields(fields) {
        let newValue = fields.map(getFieldValue).join(delimeter)

        // finally, set the value to the concatenated value of all the fields!
        setConcatenatedValue(newValue)
        props.onChange(newValue)
    }

    // if fields are provided, listen for the blur on each, then concatenate all the values of the fields together
    // and that will be the value of THIS field
    if (props.options.fields) {
        setTimeout(() => {
            let fields = []

            props.options.fields.forEach(field => {
                let el = document.getElementById(ID_PREFIX + field)

                if (!el) {
                    console.error(`Cannot concatenate using field: '${field}'. That field was not found in this document.`)
                    return
                }

                fields.push(el)

                // update the concatenated value anytime this field blurs or changes
                el.onblur = () => updateConcatenatedFieldValueFromFields(fields)
                el.onchange = () => updateConcatenatedFieldValueFromFields(fields)
                el.onkeyup = () => updateConcatenatedFieldValueFromFields(fields)
            })
        }, 500)
    }

    return (
        <BaseInput
            {...props}
            value={concatenatedValue}
            readonly={true}
        />
    )
}

export default ConcatenatedWidget
