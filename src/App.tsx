import { Editor, useMonaco } from '@monaco-editor/react';
import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import { codeExamples, ruleExamples } from './lib/examples';
import fetchGPTResponse from './lib/fetchGPTResponse';
import getSystemMessage from './lib/getSystemMessage';
import parseGPTResponse, { GPTResult } from './lib/parseGPTResponse';
import type { languages } from 'monaco-editor';

const DEBOUNCE_WAIT = 1000;
const apiKey = import.meta.env.VITE_OPENAI_KEY;
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

function App() {
  const monaco = useMonaco();
  const [value, setValue] = useState<string>('');
  const debouncedValue = useDebounce<string>(value, DEBOUNCE_WAIT);
  const [rules, setRules] = useState<string>('');
  const debouncedRules = useDebounce<string>(rules, DEBOUNCE_WAIT);
  const [result, setResult] = useState<Array<GPTResult>>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  function handleEditorChange(value: string | undefined) {
    if (value) {
      setValue(value);
    }
  }

  useEffect(() => {
    // Set the typescript options to prevent JSX being underlined
    monaco?.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
    });
    monaco?.languages.registerCodeActionProvider('typescript', {
      provideCodeActions(
        model,
        _range,
        context
      ): languages.ProviderResult<languages.CodeActionList> {
        return {
          actions: context.markers.map((error) => {
            return {
              title: 'Apply suggestion',
              diagnostics: [error],
              kind: 'quickfix',
              isPreferred: true,
              edit: {
                edits: [
                  {
                    resource: model.uri,
                    textEdit: {
                      range: error,
                      text: error.message,
                    },
                    versionId: model.getVersionId(),
                  },
                ],
              },
            };
          }),
          dispose: () => {},
        };
      },
    });
  }, [monaco?.languages]);

  useEffect(() => {
    if (!debouncedValue || !debouncedRules) return;

    const fetchResponse = async () => {
      setIsFetching(true);
      const response = await fetchGPTResponse({
        systemMsg: getSystemMessage(debouncedRules),
        userMsg: debouncedValue,
        openai,
      });
      setResult(JSON.parse(response));
      setIsFetching(false);
    };
    fetchResponse();
  }, [debouncedValue, debouncedRules]);

  useEffect(() => {
    if (!result || isFetching) return;
    // Parse the result
    if (result.length > 0) {
      const markers = parseGPTResponse(result);
      monaco?.editor.removeAllMarkers('linter');
      monaco?.editor.setModelMarkers(monaco.editor.getModels()[0], 'linter', markers);
    }
  }, [result, monaco?.editor, isFetching]);

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    monaco?.editor.getModels()[0].setValue(codeExamples[key].trim());
    setValue(codeExamples[key]);
    setRules(ruleExamples[key]);
  };

  return (
    <div className="flex justify-center w-full p-4">
      <div className="flex flex-col justify-center w-full max-w-5xl gap-4">
        <div className="flex items-center w-full gap-2">
          Enter your code and rules below, or select an example:
          <select className="p-1 border rounded border-slate-300" onChange={onSelectChange}>
            <option value="empty">Default</option>
            <option value="reactClass">Class Component</option>
            <option value="reactFunc">Functional Component</option>
            <option value="list">Rendering Lists</option>
            <option value="ticTacToe">Tic-Tac-Toe</option>
          </select>
        </div>
        <div className="border rounded border-slate-300">
          <Editor
            height="70vh"
            defaultLanguage="typescript"
            defaultValue="// Enter some code here"
            onChange={handleEditorChange}
          />
        </div>
        <div className="flex items-center justify-center w-full gap-2">
          <span>Rules:</span>
          <input
            type="textarea"
            placeholder="Add some rules here"
            className="w-full p-1 border rounded border-slate-300"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />
        </div>
        <div>
          <p>ChatGPT output:</p>
          <p>{isFetching ? 'Fetching...' : `${result.length} error(s) found`}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
