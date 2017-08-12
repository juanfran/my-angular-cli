import * as glob from 'glob';

export const getModules = (pattern: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    glob(pattern, {}, (er, files) => {
      resolve(files);
    });
  });
};
