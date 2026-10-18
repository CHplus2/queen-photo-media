const documents = new Map<string, any>();
let sequence = 0;
let tail: Promise<unknown> = Promise.resolve();
export const collection = (_db: unknown, name: string) => ({ path: name });
export const doc = (parent: unknown, name?: string, id?: string) => {
  const path = id
    ? `${name}/${id}`
    : `${(parent as any).path}/${name || `generated-${++sequence}`}`;
  return { path, id: path.split('/').at(-1)! };
};
export const seed = (path: string, data: unknown) =>
  documents.set(path, structuredClone(data));
export const read = (path: string) => structuredClone(documents.get(path));
export const entries = (prefix: string) =>
  [...documents].filter(([key]) => key.startsWith(prefix));
export const reset = () => {
  documents.clear();
  sequence = 0;
};
export async function runTransaction(
  _db: unknown,
  work: (transaction: any) => Promise<any>,
) {
  const run = tail.then(async () => {
    const pending: { path: string; data: any; merge: boolean }[] = [];
    let wrote = false;
    const result = await work({
      get: async (ref: any) => {
        if (wrote)
          throw new Error('Firestore transactions must read before writing.');
        const value = read(ref.path);
        return {
          exists: () => value !== undefined,
          data: () => value,
          id: ref.path.split('/').at(-1),
        };
      },
      set: (ref: any, data: any) => {
        wrote = true;
        pending.push({
          path: ref.path,
          data: structuredClone(data),
          merge: false,
        });
      },
      update: (ref: any, data: any) => {
        wrote = true;
        pending.push({
          path: ref.path,
          data: structuredClone(data),
          merge: true,
        });
      },
    });
    for (const item of pending)
      documents.set(
        item.path,
        item.merge ? { ...documents.get(item.path), ...item.data } : item.data,
      );
    return result;
  });
  tail = run.catch(() => {});
  return run;
}
