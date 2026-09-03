    // useEffect(() => {
    //     async function init() {
    //         if (!pyodide) return;
    //         try {
    //             // Disponibiliza o módulo PythonTerminal no Pyodide nas variáveis globais
    //             await pyodide.runPythonAsync(`
    //                 from PythonTerminal import (
    //                     introspect_members,
    //                     introspect_globals,
    //                 )
    //             `);
    //             console.log('PythonTerminal intialized.');
    //         } catch (err) {
    //             console.error('Failed to initialize PythonTerminal.', err);
    //         }

    //         // Registro do provedor de IntelliSense
    //         languages.registerCompletionItemProvider('python', {
    //             provideCompletionItems: async (model, position) => {
    //                 const suggestions: languages.CompletionItem[] = [];
    //                 try {
    //                     // 1. Palavra atual sob o cursor
    //                     const word = model.getWordUntilPosition(position);

    //                     // 2. Texto da linha até o início da palavra atual
    //                     const textBeforeWord = model.getValueInRange({
    //                         startLineNumber: position.lineNumber,
    //                         startColumn: 1,
    //                         endLineNumber: position.lineNumber,
    //                         endColumn: word.startColumn,
    //                     }).trim();

    //                     interface Token {
    //                         name: string;
    //                         kind: 'Type' | 'Callable' | 'Object';
    //                     }
    //                     let tokens: Token[] = [];

    //                     // 3. Se o texto antes da palavra termina com ponto (ex: "sys." ou "my_obj.")
    //                     if (textBeforeWord.endsWith('.')) {
    //                         const identifier = textBeforeWord.slice(0, -1).trim();

    //                         if (identifier) {
    //                             const members = await pyodide.runPythonAsync(`introspect_members(${identifier})`);
    //                             tokens = members.toJs({ dict_converter: Object.fromEntries });
    //                             members.destroy();
    //                         }
    //                     } else {
    //                         // 4. Digitação padrão / espaço / vírgula -> busca globais
    //                         const pyGlobals = await pyodide.runPythonAsync(`introspect_globals()`);
    //                         tokens = pyGlobals.toJs({ dict_converter: Object.fromEntries });
    //                         pyGlobals.destroy();
    //                     }

    //                     const range = {
    //                         startLineNumber: position.lineNumber,
    //                         endLineNumber: position.lineNumber,
    //                         startColumn: word.startColumn,
    //                         endColumn: word.endColumn,
    //                     };

    //                     // Registra tokens como sugestões
    //                     for (const token of tokens) {
    //                         let kind: languages.CompletionItemKind;
    //                         switch (token.kind) {
    //                             case 'Type':
    //                                 kind = languages.CompletionItemKind.Class;
    //                                 break;
    //                             case 'Callable':
    //                                 kind = languages.CompletionItemKind.Function;
    //                                 break;
    //                             default:
    //                                 kind = languages.CompletionItemKind.Variable;
    //                                 break;
    //                         }
    //                         suggestions.push({
    //                             label: token.name,
    //                             kind: kind,
    //                             insertText: token.name,
    //                             range: range,
    //                         });
    //                     }
    //                 } catch (err) {
    //                     console.error("Failed introspecting.", err);
    //                 }
    //                 return { suggestions };
    //             }
    //         });
    //     }
    //     init();
    // }, [pyodide]);
