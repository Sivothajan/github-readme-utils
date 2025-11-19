import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

/**
 * ⚠️ Top-level await is not supported in CommonJS (CJS) modules.
 * Node only supports top-level await in ESM modules ("type": "module").
 */
(async () => {
  // --- ANSI Color Helpers ---
  const fmt = {
    reset: '\x1b[0m',
    bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
    red: (text: string) => `\x1b[31m${text}\x1b[0m`,
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
    blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
    magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
    cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
    white: (text: string) => `\x1b[37m${text}\x1b[0m`,
  };

  const SRC = 'assets/logo.svg';
  const OUT = 'public/favicon';
  const OG_SRC = 'assets/og-image.svg';
  const OG_OUT_DIR = 'public/images';

  const args = process.argv.slice(2);
  const generateOG = args.includes('--generate-og');
  const generateFavicons = args.includes('--generate-favicons');

  const checkEnvVars = (generateFavicons: boolean, generateOG: boolean) => {
    if (!generateFavicons && !generateOG) {
      console.log(
        fmt.yellow(
          'No assets to generate. Set --generate-og and/or --generate-favicons flag(s).'
        )
      );
      return;
    }
  };

  checkEnvVars(generateFavicons, generateOG);

  if (generateFavicons) {
    await fs.mkdir(OUT, { recursive: true });
    // All favicon sizes (includes Threads 42x42)
    const pngSizes = [
      16, 32, 42, 48, 57, 60, 72, 76, 114, 120, 144, 152, 167, 180, 192, 256,
      512, 1024,
    ];

    const webpSizes = [16, 32, 42, 48, 72, 144, 192, 512];
    const icoSizes = [16, 32, 48, 256];

    const aliases = new Map([
      [16, 'favicon-16x16'],
      [32, 'favicon-32x32'],
      [42, 'favicon-42x42'],
      [48, 'favicon-48x48'],
      [72, 'android-chrome-72x72'],
      [144, 'android-chrome-144x144'],
      [192, 'android-chrome-192x192'],
      [256, 'favicon-256x256'],
      [512, 'android-chrome-512x512'],
      [57, 'apple-touch-icon-57x57'],
      [60, 'apple-touch-icon-60x60'],
      [76, 'apple-touch-icon-76x76'],
      [114, 'apple-touch-icon-114x114'],
      [120, 'apple-touch-icon-120x120'],
      [152, 'apple-touch-icon-152x152'],
      [167, 'apple-touch-icon-167x167'],
      [180, 'apple-touch-icon-180x180'],
      [1024, 'apple-touch-icon-1024x1024'],
    ]);

    await fs.mkdir(OUT, { recursive: true });

    // --- 1️⃣ Generate PNGs (Cyan)
    for (const size of pngSizes) {
      const name = aliases.get(size) ?? `favicon-${size}x${size}`;
      const file = path.join(OUT, `${name}.png`);
      await sharp(SRC, {
        density: Math.max(256, size * 8),
        limitInputPixels: false,
      })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toFile(file);
      console.log(`${fmt.cyan('PNG')}  ${size}x${size}`);
    }

    // --- 2️⃣ Generate WebPs (Magenta)
    for (const size of webpSizes) {
      const name = aliases.get(size) ?? `favicon-${size}x${size}`;
      const file = path.join(OUT, `${name}.webp`);
      await sharp(SRC, {
        density: Math.max(256, size * 8),
        limitInputPixels: false,
      })
        .resize(size, size)
        .webp({ quality: 95 })
        .toFile(file);
      console.log(`${fmt.magenta('WEBP')} ${size}x${size}`);
    }

    // --- 3️⃣ Generate ICO (Yellow)
    const icoFiles = icoSizes.map((s) =>
      path.join(OUT, `favicon-${s}x${s}.png`)
    );
    for (const file of icoFiles) {
      await fs.access(file);
    }
    const icoBuffer = await pngToIco(icoFiles);
    await fs.writeFile(path.join(OUT, 'favicon.ico'), icoBuffer);
    console.log(`${fmt.yellow('ICO')}   favicon.ico (includes 256x256)`);

    // --- 4️⃣ Copy original SVG (Blue)
    await fs.copyFile(SRC, path.join(OUT, 'logo-symbol-icon.svg'));
    console.log(`${fmt.blue('SVG')}   logo-symbol-icon.svg`);

    // --- 5️⃣ Generate site.webmanifest (Bold White)
    const manifest = {
      name: 'GitHub Readme Utils',
      short_name: 'GitHub Readme Utils',
      start_url: '/',
      scope: '/',
      lang: 'en',
      icons: [
        {
          src: '/favicon/android-chrome-72x72.webp',
          sizes: '72x72',
          type: 'image/webp',
        },
        {
          src: '/favicon/android-chrome-144x144.webp',
          sizes: '144x144',
          type: 'image/webp',
        },
        {
          src: '/favicon/android-chrome-192x192.webp',
          sizes: '192x192',
          type: 'image/webp',
        },
        {
          src: '/favicon/android-chrome-512x512.webp',
          sizes: '512x512',
          type: 'image/webp',
        },
        {
          src: '/favicon/android-chrome-72x72.png',
          sizes: '72x72',
          type: 'image/png',
        },
        {
          src: '/favicon/android-chrome-144x144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: '/favicon/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/favicon/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        { src: '/favicon/logo-symbol-icon.svg', type: 'image/svg+xml' },
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    };

    await fs.writeFile(
      path.join(OUT, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );
    console.log(`${fmt.bold(fmt.white('MANIFEST'))} site.webmanifest`);
  } else {
    console.log(
      fmt.yellow(
        'Skipping favicon generation (set --generate-favicons flag to enable)'
      )
    );
  }

  if (generateOG) {
    await fs.mkdir(OG_OUT_DIR, { recursive: true });
    // --- 6️⃣ Generate OG image (Red)
    const ogPng = path.join(OG_OUT_DIR, 'og.png');
    const ogWebp = path.join(OG_OUT_DIR, 'og.webp');
    await sharp(OG_SRC, {
      density: 600,
      limitInputPixels: false,
    })
      .resize(1200, 630)
      .png({ compressionLevel: 9 })
      .toFile(ogPng);
    console.log(`${fmt.red('OG')}   og.png`);

    await sharp(OG_SRC, {
      density: 600,
      limitInputPixels: false,
    })
      .resize(1200, 630)
      .webp({ quality: 95 })
      .toFile(ogWebp);
    console.log(`${fmt.red('OG')}   og.webp`);
  } else {
    console.log(
      fmt.yellow('Skipping OG generation (set --generate-og flag to enable)')
    );
  }

  // --- Final Success Message (Green & Bold)
  if (generateFavicons && generateOG) {
    console.log(
      fmt.bold(
        fmt.green(
          '\n✅ All favicon assets, ICO (256x256), manifest, and OG images generated successfully.'
        )
      )
    );
  } else if (generateFavicons && !generateOG) {
    console.log(
      fmt.bold(
        fmt.green(
          '\n✅ All favicon assets, ICO (256x256), and manifest generated successfully.'
        )
      )
    );
  } else if (!generateFavicons && generateOG) {
    console.log(fmt.bold(fmt.green('\n✅ OG images generated successfully.')));
  }
})();
