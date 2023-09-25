import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

function App() {
  const [value, setValue] = useState<string>('');
  const debouncedValue = useDebounce<string>(value, 500);

  function handleEditorChange(value: string | undefined) {
    if (value) {
      setValue(value);
    }
  }

  useEffect(() => {
    console.log({ debouncedValue });
  }, [debouncedValue]);

  return (
    <div className="flex justify-center w-full p-4">
      <div className="w-full max-w-5xl">
        <div className="border border-slate-400">
          <Editor
            height="70vh"
            defaultLanguage="javascript"
            defaultValue="// Enter some code here"
            onChange={handleEditorChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
