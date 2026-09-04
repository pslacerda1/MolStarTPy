import React, { useState, useRef, useEffect } from 'react';
import { Editor, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';


import { PythonEnvironment } from '../PythonEnvironment/environment';
import { TRANSFER_NULL } from '../PythonEnvironment/utils'
import { DivResizer } from '../DivResizer';
import { Logger } from '../../utils';


const log = Logger();

const LOG_STORAGE_KEY = 'python_terminal_log_history';
const WELCOME_MESSAGE =
    'Welcome! Type Python code below.'
' Press Enter to execute and Ctrl+Enter to break lines.';

export const PythonTerminal = () => {
    const [editedCode, setEditedCode] = useState<string>('script01(["1BZL", "2JK6", "5SMJ"])');
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const isExecutingRef = useRef<boolean>(false);
    const commandHistoryRef = useRef<string[]>([]);
    const logEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const codeEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const python = PythonEnvironment('main');
    const [pythonState, setPythonState] = useState<string>(python.state);

    useEffect(() => {
        python.setup();
        python.configureStderr(appendLog);
        python.configureStdout(appendLog);

        python.subscribeStateChanges((newState) => {
            setPythonState(newState);
            const codeEditor = codeEditorRef.current;
            if (!codeEditor) return;

            if (newState === 'WORKING') {
                appendLog('');
                appendLog(WELCOME_MESSAGE);
            }
        });
    }, []);

    // 1. Inserção instantânea de texto puro no Monaco + LocalStorage
    const appendLog = (text: string) => {
        if (!text) return;
        const lineToAppend = text.endsWith('\n') ? text : text + '\n';

        // Persistência imediata em texto puro no localStorage
        const currentSaved = localStorage.getItem(LOG_STORAGE_KEY) || '';
        const updatedLog = currentSaved + lineToAppend;
        localStorage.setItem(LOG_STORAGE_KEY, updatedLog);

        // Atualização imediata no editor do Monaco (sem re-renderizar o React)
        const editor = logEditorRef.current;
        if (editor) {
            const model = editor.getModel();
            if (model) {
                const lastLineNumber = model.getLineCount();
                const lastColumn = model.getLineMaxColumn(lastLineNumber);

                // Aplica a edição no final do documento
                model.applyEdits([
                    {
                        range: {
                            startLineNumber: lastLineNumber,
                            startColumn: lastColumn,
                            endLineNumber: lastLineNumber,
                            endColumn: lastColumn,
                        },
                        text: lineToAppend,
                        forceMoveMarkers: true,
                    },
                ]);

                // Rola suavemente para a última linha
                editor.revealLine(model.getLineCount());
            }
        }
    };

    // 2. Montagem do Editor de Log: carrega o texto acumulado do LocalStorage
    const handlelogEditorMount: OnMount = (logEditor) => {
        logEditorRef.current = logEditor;

        let initialContent = localStorage.getItem(LOG_STORAGE_KEY) || '';
        if (initialContent.length > 999999) {
            log.warn('Log content is too large, truncating to last 1 million characters.');
            initialContent = initialContent.slice(-999999);
            localStorage.setItem(LOG_STORAGE_KEY, initialContent);
        }

        if (initialContent) {
            logEditor.setValue(initialContent);
            const lastLine = logEditor.getModel()?.getLineCount() || 1;
            logEditor.revealLine(lastLine);
        }
    };

    // Execução do REPL
    const handleRun = async (codeEditor: monaco.editor.IStandaloneCodeEditor) => {
        const cmd = codeEditor?.getValue();
        if (!codeEditor || !cmd || !cmd.trim()) return;

        isExecutingRef.current = true;
        codeEditor.updateOptions({ readOnly: true });

        // Guarda o comando executado no histórico de setas UP/DOWN
        commandHistoryRef.current.push(cmd);
        setHistoryIndex(-1);

        // Limpa o campo de input
        setEditedCode('');
        codeEditor.setValue('');

        // Mostra o comando digitado
        appendLog(`>>> ${cmd.trim()}`);

        try {
            await python.runCodeOnWorker(cmd, {
                globals: TRANSFER_NULL,
                printRepr: true
            });
        } catch (err: any) {
            // Mostra a mensagem de erro caso quebre
            appendLog(err.toString());
        } finally {
            isExecutingRef.current = false;
            codeEditor.updateOptions({ readOnly: false });
        }
    };

    const handleCodeEditorMount: OnMount = (codeEditor) => {
        codeEditorRef.current = codeEditor;

        // Enter puro dispara a execução
        codeEditor.addCommand(monaco.KeyCode.Enter, () => {
            if (isExecutingRef.current)
                return;
            handleRun(codeEditor);
        });

        // Seta para cima
        // Navega para comandos anteriores
        codeEditor.addAction({
            id: 'history-prev-command',
            label: 'Previous History Command',
            keybindings: [monaco.KeyCode.UpArrow],
            precondition: '!suggestWidgetVisible',
            run: () => {
                const history = commandHistoryRef.current;
                if (history.length === 0) return;

                setHistoryIndex(currentIndex => {
                    const nextIndex = currentIndex < history.length - 1 ? currentIndex + 1 : currentIndex;
                    const prevCmd = history[history.length - 1 - nextIndex] || '';

                    setEditedCode(prevCmd);
                    return nextIndex;
                });
            }
        });

        // Seta para baixo
        // Navega para comandos mais recentes, ou limpa
        codeEditor.addAction({
            id: 'history-next-command',
            label: 'Next History Command',
            keybindings: [monaco.KeyCode.DownArrow],
            precondition: '!suggestWidgetVisible',
            run: () => {
                const history = commandHistoryRef.current;
                if (history.length === 0) return;

                setHistoryIndex(currentIndex => {
                    if (currentIndex > 0) {
                        const nextIndex = currentIndex - 1;
                        const nextCmd = history[history.length - 1 - nextIndex] || '';

                        setEditedCode(nextCmd);
                        return nextIndex;
                    } else {
                        setEditedCode('');
                        return -1;
                    }
                });
            }
        });
    };

    if (python.state != 'WORKING') {
        return <div className=''>
            Loading Python Environment <b>:-]</b>
            <br />
            It may be slow to warm up...
        </div>;
    }
    return <>
        <DivResizer
            title={'Resize the console'}
            top={
                <Editor
                    language="python"
                    theme="vs-dark"
                    onMount={handlelogEditorMount}
                    options={{
                        minimap: { enabled: false },
                        readOnly: true,
                        fontSize: 14,
                        lineNumbers: 'off',
                        folding: false,
                        glyphMargin: false,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                    }} />
            }

            bottom={
                <Editor
                    language="python"
                    theme="vs-dark"
                    value={editedCode}
                    onMount={handleCodeEditorMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'off',
                        folding: false,
                        glyphMargin: false,
                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                    }} />
            }
        />
    </>;
};