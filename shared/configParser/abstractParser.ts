import fs from '../node/fs';
import type { FSWatcher } from 'fs';

export default abstract class AbstractParser {
  private watchers: FSWatcher[] = [];
  constructor(public filePath: string) {}
  abstract parse(content: string): any;
  abstract stringify(data: any): string;
  load(): any {
    const content = fs.readFileSync(this.filePath, 'utf-8');
    return this.parse(content);
  }
  reload(): any {
    return this.load();
  }
  save(data: any): void {
    const content = this.stringify(data);
    fs.writeFileSync(this.filePath, content, 'utf-8');
  }
  watch(cb: (data: any) => void): () => void {
    const watcher = fs.watch(this.filePath, async (evt) => {
      if (evt === 'change') {
        cb(this.reload());
      }
    });
    this.watchers.push(watcher);
    return () => watcher?.close();
  }
}
