interface AppConfig {
  NEXT_PUBLIC_BASE_URL: string;
}

const { NEXT_PUBLIC_BASE_URL } = process.env;

export const appConfig: AppConfig = {
  NEXT_PUBLIC_BASE_URL: NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000/',
};

const checkAppConfig = (appConfig: AppConfig) => {
  const missing = Object.entries(appConfig)
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
       * \x1b[1;31m => bold red (Missing appironment variables)
       * \x1b[1;33m => bold yellow (Please set them in your appironment...)
       * \x1b[0m => reset to default color
       */
      `\n\x1b[1;31mMissing appironment variables: ${missing.join(', ')}\x1b[0m\n` +
        `\x1b[1;33mPlease set them in your appironment before running the application.\x1b[0m\n`
    );
  }
};

checkAppConfig(appConfig);

export default appConfig;
