import * as fs from 'fs';

export function createHFile(): void {
  const content = 'Hello, this is a simple text file!';
  fs.writeFileSync('hi.txt', content, 'utf-8');
}
