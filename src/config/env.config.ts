interface EnvConfig {
  GITHUB_TOKEN: string;
}

const { GITHUB_TOKEN } = process.env;

export const config: EnvConfig = {
  GITHUB_TOKEN: GITHUB_TOKEN ?? '',
};

const checkEnvConfig = (config: EnvConfig) => {
  const missing = Object.entries(config)
    .filter(
      ([, value]) =>
        typeof value === 'string' &&
        (!value ||
          value.trim() === '' ||
          value === 'undefined' ||
          value === 'null')
    )
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(
      /**
       * \x1b[1;31m => bold red (Missing environment variables)
       * \x1b[1;33m => bold yellow (Please set them in your environment...)
       * \x1b[0m => reset to default color
       */
      `\n\x1b[1;31mMissing environment variables: ${missing.join(', ')}\x1b[0m\n` +
        `\x1b[1;33mPlease set them in your environment before running the application.\x1b[0m\n`
    );
  }
};

checkEnvConfig(config);

export default config;
