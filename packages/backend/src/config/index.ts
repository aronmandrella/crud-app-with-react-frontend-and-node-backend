import { object, string, nonempty, assert } from 'superstruct';
import fs from 'fs';
import dotenv from 'dotenv';

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const detectNodeEnv = () => {
  /*
    NOTE:
    Setting NODE_ENV with cross-env with NestCLI doesn't work, I didn't find
    a fix in the docs so I used other environment variable as a quick workaround. 
  */
  const environment = process.env.NODE_ENV || process.env.NEST_JS_NODE_ENV;

  switch (environment) {
    case 'production':
    case 'development':
    case 'test':
      return environment;

    default:
      throw new Error(
        `Server was started with unexpected SERVER_ENVIRONMENT '${environment}'.`,
      );
  }
};

const readDotEnvFile = (path: string) => {
  const content = fs.readFileSync(path, 'utf-8');
  const parsedContent = dotenv.parse(content);

  const envFileSchema = object({
    SQLITE_DATABASE: nonempty(string()),
    FRONTEND_URL: nonempty(string()),
    APP_PORT: nonempty(string()),
  });

  assert(parsedContent, envFileSchema);

  return parsedContent;
};

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const NODE_ENV = detectNodeEnv();
const ENV_FILE_PATH: `.env.${typeof NODE_ENV}` = `.env.${NODE_ENV}`;

const ENV_DATA = readDotEnvFile(ENV_FILE_PATH);

const config = {
  ENVIRONMENT: NODE_ENV,
  ...ENV_DATA,
};

export default config;
