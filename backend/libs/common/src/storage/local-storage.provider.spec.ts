import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LocalStorageProvider } from './local-storage.provider';

function makeUpload(name: string, content: string): Express.Multer.File {
  const buffer = Buffer.from(content);
  return {
    buffer,
    originalname: name,
    size: buffer.length,
    mimetype: 'text/plain',
  } as unknown as Express.Multer.File;
}

describe('LocalStorageProvider', () => {
  let uploadDir: string;
  let provider: LocalStorageProvider;

  beforeEach(() => {
    uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-spec-'));
    provider = new LocalStorageProvider({
      uploadDir,
      baseUrl: 'http://localhost:3000/media/files',
    });
  });

  afterEach(() => {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  });

  it('writes the file under the user directory and returns metadata', async () => {
    const result = await provider.upload(makeUpload('hello.txt', 'hello world'), 'user-1');

    expect(result.key).toMatch(/^user-1\/.+\.txt$/);
    expect(result.sizeBytes).toBe('hello world'.length);
    expect(result.mimeType).toBe('text/plain');
    expect(result.url).toContain(result.key);
    expect(fs.existsSync(path.join(uploadDir, result.key))).toBe(true);
    expect(fs.readFileSync(path.join(uploadDir, result.key), 'utf8')).toBe('hello world');
  });

  it('builds a public URL for a key', () => {
    expect(provider.getPublicUrl('user-1/file.png')).toBe(
      'http://localhost:3000/media/files/user-1/file.png',
    );
  });
});
