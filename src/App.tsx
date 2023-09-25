import { Editor, useMonaco } from '@monaco-editor/react';
import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import getSystemMessage from './lib/getSystemMessage';
import { MarkerSeverity, editor } from 'monaco-editor';

const apiKey = import.meta.env.VITE_OPENAI_KEY;
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});
const DEBOUNCE_WAIT = 1000;

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
      jsx: 2,
    });
  }, [monaco]);

  useEffect(() => {
    if (!debouncedValue || !debouncedRules) return;

    const fetchResponse = async () => {
      setResult('Fetching...');
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: getSystemMessage(debouncedRules) },
            { role: 'user', content: debouncedValue },
          ],
        });
        const responseMessageContent = response?.choices?.[0]?.message?.content;
        if (responseMessageContent) {
          setResult(responseMessageContent);
        }
      } catch (error) {
        console.error(error);
        setResult('Error fetching GPT result');
      }
    };
    fetchResponse();
  }, [debouncedValue, debouncedRules]);

  useEffect(() => {
    const addMarkers = () => {
      if (!result || result.toLowerCase() === 'all rules passed') return;
      const resultLines = result.split('\n');
      // For each line
      const markers: editor.IMarkerData[] = resultLines.map((line) => {
        // Split by : to get line number and message
        const [number, message] = line.split(':');
        // Return the marker data (using whole line for now)
        return {
          startLineNumber: parseInt(number, 10) || -1,
          endLineNumber: parseInt(number, 10) || -1,
          startColumn: 0,
          endColumn: Infinity, // Will be trimmed to end of line
          message: message?.trim(),
          severity: MarkerSeverity.Error,
        };
      });
      monaco?.editor.setModelMarkers(monaco.editor.getModels()[0], 'linter', markers);
    };
    addMarkers();
  }, [result, monaco?.editor]);

  return (
    <div className="flex justify-center w-full p-4">
      <div className="w-full max-w-5xl flex justify-center flex-col gap-4">
        <div className="border border-slate-300">
          <Editor
            height="70vh"
            defaultLanguage="typescript"
            defaultValue="// Enter some code here"
            onChange={handleEditorChange}
          />
        </div>
        <div className="flex justify-center w-full gap-2">
          <span>Rules:</span>
          <input
            type="textarea"
            placeholder="Add some rules here"
            className="border rounded border-slate-300 px-1 w-full"
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
