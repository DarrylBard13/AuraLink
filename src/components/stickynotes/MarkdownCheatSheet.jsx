import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function MarkdownCheatSheet({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel text-white border-white/20 max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Markdown Cheat Sheet</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6 text-sm">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Headers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded">
                  # Header 1<br/>
                  ## Header 2<br/>
                  ### Header 3
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <div className="text-xl font-bold">Header 1</div>
                <div className="text-lg font-semibold">Header 2</div>
                <div className="text-base font-medium">Header 3</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Text Formatting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded">
                  **Bold text**<br/>
                  *Italic text*<br/>
                  ***Bold and italic***<br/>
                  ~~Strikethrough~~<br/>
                  `Inline code`
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <div><strong>Bold text</strong></div>
                <div><em>Italic text</em></div>
                <div><strong><em>Bold and italic</em></strong></div>
                <div><del>Strikethrough</del></div>
                <div><code className="bg-white/20 px-1 rounded">Inline code</code></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Lists</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded">
                  - Item 1<br/>
                  - Item 2<br/>
                  &nbsp;&nbsp;- Nested item<br/>
                  - Item 3<br/><br/>
                  
                  1. First item<br/>
                  2. Second item<br/>
                  3. Third item
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <ul className="list-disc ml-4 space-y-1">
                  <li>Item 1</li>
                  <li>Item 2
                    <ul className="list-disc ml-4 mt-1">
                      <li>Nested item</li>
                    </ul>
                  </li>
                  <li>Item 3</li>
                </ul>
                <ol className="list-decimal ml-4 space-y-1 mt-3">
                  <li>First item</li>
                  <li>Second item</li>
                  <li>Third item</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Links & Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded">
                  [Link text](https://example.com)<br/>
                  ![Image alt text](image-url.jpg)
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <div><a href="#" className="text-blue-300 underline">Link text</a></div>
                <div className="text-sm">🖼️ Image alt text</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Blockquotes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded">
                  &gt; This is a quote<br/>
                  &gt; spanning multiple lines
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <blockquote className="border-l-4 border-white/40 pl-4 italic text-white/70">
                  This is a quote<br/>
                  spanning multiple lines
                </blockquote>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Code Blocks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded">
                  ```<br/>
                  function hello() {"{"}<br/>
                  &nbsp;&nbsp;console.log("Hello!");<br/>
                  {"}"}<br/>
                  ```
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <pre className="bg-white/20 p-2 rounded text-sm">
                  <code>{`function hello() {
  console.log("Hello!");
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Tables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded text-xs">
                  | Header 1 | Header 2 |<br/>
                  |----------|----------|<br/>
                  | Cell 1   | Cell 2   |<br/>
                  | Cell 3   | Cell 4   |
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <table className="border-collapse border border-white/40 text-sm">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="border border-white/40 px-2 py-1">Header 1</th>
                      <th className="border border-white/40 px-2 py-1">Header 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/40 px-2 py-1">Cell 1</td>
                      <td className="border border-white/40 px-2 py-1">Cell 2</td>
                    </tr>
                    <tr>
                      <td className="border border-white/40 px-2 py-1">Cell 3</td>
                      <td className="border border-white/40 px-2 py-1">Cell 4</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Horizontal Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-mono bg-white/10 p-2 rounded">
                  ---<br/>
                  or<br/>
                  ***
                </div>
              </div>
              <div className="space-y-2 text-white/80">
                <hr className="border-white/40" />
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-200 mb-2">💡 Tips</h4>
            <ul className="text-blue-100 text-sm space-y-1 list-disc ml-4">
              <li>Press the Preview button to see how your markdown will look</li>
              <li>You can combine multiple formatting styles</li>
              <li>Use two spaces at the end of a line for a line break</li>
              <li>Empty lines create paragraph breaks</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}