import { Editor, useMonaco } from '@monaco-editor/react';
import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import fetchGPTResponse from './lib/fetchGPTResponse';
import getSystemMessage from './lib/getSystemMessage';
import parseGPTResponse from './lib/parseGPTResponse';

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
  const [result, setResult] = useState<string>('');

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
  }, [monaco]);

  useEffect(() => {
    if (!debouncedValue || !debouncedRules) return;

    const fetchResponse = async () => {
      setResult('Fetching...');
      const response = await fetchGPTResponse({
        systemMsg: getSystemMessage(debouncedRules),
        userMsg: debouncedValue,
        openai,
      });
      setResult(response);
    };
    fetchResponse();
  }, [debouncedValue, debouncedRules]);

  useEffect(() => {
    if (!result || result.toLowerCase() === 'all rules passed') return;
    const parsedMarkers = parseGPTResponse(result);
    monaco?.editor.setModelMarkers(monaco.editor.getModels()[0], 'linter', parsedMarkers);
  }, [result, monaco?.editor]);

  return (
    <div className="flex justify-center w-full p-4">
      <div className="w-full max-w-5xl flex justify-center flex-col gap-4">
        <div className="border rounded border-slate-300">
          <Editor
            height="70vh"
            defaultLanguage="typescript"
            defaultValue="// Enter some code here"
            onChange={handleEditorChange}
          />
        </div>
        <div className="flex justify-center items-center w-full gap-2">
          <span>Rules:</span>
          <input
            type="textarea"
            placeholder="Add some rules here"
            className="border rounded border-slate-300 p-1 w-full"
            onChange={(e) => setRules(e.target.value)}
          />
        </div>
        <div>
          <p>ChatGPT output:</p>
          <p>{result}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
