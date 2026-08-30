import React, { useState, useRef, useEffect } from 'react';
import { Editor, Monaco, OnMount } from '@monaco-editor/react';
import { languages } from 'monaco-editor';

import { usePythonEnvironment } from '../PythonEnvironment';
import { DivResizer } from '../DivResizer';


export const PythonTerminal: React.FunctionComponent = () => {
    const { pyodide } = usePythonEnvironment();
    const [editedCode, setEditedCode] = useState<string>('script01(["1BZL", "2JK6", "5SMJ"])');
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [logContent, setLogContent] = useState<string>('');

    const isExecutingRef = useRef<boolean>(false);
    const commandHistoryRef = useRef<string[]>([]);
    const logEditorRef = useRef<Monaco | null>(null);

    const handlelogEditorMount: OnMount = (logEditor: Monaco) => {
        logEditorRef.current = logEditor;
    };

    // Atualiza editor com o novo conteúdo do log.
    const updateLogContent = (newText: string) => {
        setLogContent(newText);
        if (logEditorRef.current) {
            logEditorRef.current.setValue(newText);

            // após atualizar o conteúdo, scrolla pra última linha
            const lastLine = logEditorRef.current.getModel()?.getLineCount() || 1;
            logEditorRef.current.revealLine(lastLine);
        }
    };

    useEffect(() => {
        async function init() {
            if (!pyodide) return;
            try {
                // Disponibiliza o módulo PythonTerminal no Pyodide nas variáveis globais
                await pyodide.runPythonAsync(`
                    from PythonTerminal import (
                        introspect_members,
                        introspect_globals,
                    )
                `);
            } catch (err) {
                console.error('Failed to initialize PythonTerminal.', err);
            }

            // Registro do provedor de IntelliSense
            languages.registerCompletionItemProvider('python', {
                provideCompletionItems: async (model, position) => {
                    const suggestions: languages.CompletionItem[] = [];
                    try {
                        // 1. Palavra atual sob o cursor
                        const word = model.getWordUntilPosition(position);

                        // 2. Texto da linha até o início da palavra atual
                        const textBeforeWord = model.getValueInRange({
                            startLineNumber: position.lineNumber,
                            startColumn: 1,
                            endLineNumber: position.lineNumber,
                            endColumn: word.startColumn,
                        }).trim();

                        interface Token {
                            name: string;
                            kind: 'Type' | 'Callable' | 'Object';
                        }
                        let tokens: Token[] = [];

                        // 3. Se o texto antes da palavra termina com ponto (ex: "sys." ou "my_obj.")
                        if (textBeforeWord.endsWith('.')) {
                            const identifier = textBeforeWord.slice(0, -1).trim();

                            if (identifier) {
                                const members = await pyodide.runPythonAsync(`introspect_members(${identifier})`);
                                tokens = members.toJs({ dict_converter: Object.fromEntries });
                                members.destroy();
                            }
                        } else {
                            // 4. Digitação padrão / espaço / vírgula -> busca globais
                            const pyGlobals = await pyodide.runPythonAsync(`introspect_globals()`);
                            tokens = pyGlobals.toJs({ dict_converter: Object.fromEntries });
                            pyGlobals.destroy();
                        }

                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        };

                        // Registra tokens como sugestões
                        for (const token of tokens) {
                            let kind: languages.CompletionItemKind;
                            switch (token.kind) {
                                case 'Type':
                                    kind = languages.CompletionItemKind.Class;
                                    break;
                                case 'Callable':
                                    kind = languages.CompletionItemKind.Function;
                                    break;
                                default:
                                    kind = languages.CompletionItemKind.Variable;
                                    break;
                            }
                            suggestions.push({
                                label: token.name,
                                kind: kind,
                                insertText: token.name,
                                range: range,
                            });
                        }
                    } catch (err) {
                        console.error("Failed introspecting.", err);
                    }
                    return { suggestions };
                }
            });
        }
        init();
    }, [pyodide]);


    // Cuida da execução do REPL.
    const handleRun = async (codeEditor: Monaco) => {
        const cmd = codeEditor?.getValue();
        if (!pyodide || !codeEditor || !cmd || !cmd.trim())
            return;
        isExecutingRef.current = true;

        // adiciona comando ao histórico
        commandHistoryRef.current.push(cmd);
        setHistoryIndex(-1);

        // limpa campo de digitação
        setEditedCode('');
        codeEditor.setValue('');

        // cuida do log...
        // lê e escreve várias vezes...
        // só não é tão lento pq é na memória
        let log = '';
        const readLog = () => {
            try {
                log = pyodide.FS.readFile('/tmp/console.log', { encoding: 'utf8' });
            } catch (e) { }
        };
        const appendLog = (text: string) => {
            readLog();
            pyodide.FS.writeFile('/tmp/console.log', log + text);
        };
        try {
            // efetivamente executa o código
            readLog();
            appendLog(`>>> ${cmd.trim()}\n`);
            const result = await pyodide.runPythonAsync(cmd);

            // salva eventuais resultado
            if (result !== undefined) {
                const msg = String(result);
                readLog();
                appendLog(`${msg}\n`);
            }

            // salva log em caso de erro
        } catch (err: any) {
            const msg = err.toString();
            readLog();
            appendLog(`${msg}\n`);
        }
        finally {
            // exibe tudo na tela
            readLog();
            updateLogContent(log); // check!
            isExecutingRef.current = false;
        }
    };


    const handleCodeEditorMount: OnMount = (codeEditor, monaco) => {
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

    if (!pyodide) {
        return <div className=''>
            Loading Python Environment & IntelliSense...
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