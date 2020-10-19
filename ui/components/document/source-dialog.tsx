import Card from 'react-bootstrap/Card'
import React from 'react'
import styles from './source-dialog.module.css'
import Button from 'react-bootstrap/Button'
import { useState, useEffect } from 'react'
import CodeEditor from '../code-editor'

function isValidJSON(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

const SourceDialog = ({ source, title, onSave }) => {
    const [newSource, setNewSource] = useState({})
    const [validJson, setValidJson] = useState(true)            // used for disabling the save button if user typed in invalid JSON

    // anytime the source changes, update our internal state
    useEffect(() => {
        if (source) {
            let newSource = source
            delete newSource['x-meditor']
            delete newSource._id
            setNewSource(newSource)
        }
    }, [source])

    const handleClick = (event) => {
        event.preventDefault()
        onSave(newSource)
    }

    const handleSourceChange = (source) => {
        setValidJson(true)

        if (!source) {
            return source
        }

        if (typeof source !== 'string') {
            setNewSource(source)
            return
        }

        // need to make sure JSON is valid before allowing the user to save it
        if (!isValidJSON(source)) {
            setValidJson(false)
            return
        }

        setNewSource(JSON.parse(source))
    }

    return (
        <div>
            <Card className={styles.card}>
                <Card.Body>
                    {source && <>
                        <CodeEditor
                            text={source ? JSON.stringify(source, null, 2) : ""}
                            style={{ width: '100%' , height: '400px', display: 'block' }}
                            onTextChange={handleSourceChange}
                        />

                        <div>
                            <Button
                                className={styles.button}
                                variant="secondary"
                                onClick={handleClick}
                                disabled={!validJson}
                            >
                                Save
                            </Button>
                        </div>
                        <div className={styles.note}>
                            <p><b>Note:</b> To undo an action press Ctrl+Z</p>
                        </div>
                    </>}
                </Card.Body>
            </Card>
        </div>
    )
}

export default SourceDialog
