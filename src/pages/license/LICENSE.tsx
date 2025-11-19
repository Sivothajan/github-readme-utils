import Link from 'next/link';
import type { CSSProperties } from 'react';

const hiddenSectionStyle: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const LICENSE = () => {
  return (
    <section
      aria-label="Software license notice"
      style={hiddenSectionStyle}
      data-hidden-license
    >
      <p>
        This project is governed by the{' '}
        <strong>Sivothayan Sivasiva Proprietary License (2025-01)</strong>.
      </p>

      <p>
        © 2025 Sivothayan Sivasiva —
        <Link
          href="https://sivothajan.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://sivothajan.dev
        </Link>
        . All rights reserved.
      </p>

      <ul>
        <li>
          Only <strong>viewing</strong> and{' '}
          <strong>internal, non-commercial</strong>
          evaluation is permitted.
        </li>
        <li>
          <strong>Do not modify, distribute, or use commercially</strong>{' '}
          without explicit written consent.
        </li>
        <li>
          Third-party npm components retain their original licenses; refer to
          the
          <Link href="/license#third-party-notices">/license</Link>document for
          full details.
        </li>
        <li>
          Unauthorized use must cease immediately and all copies must be
          deleted.
        </li>
        <li>
          This software is proprietary and not open source. Review the dedicated
          license route at{' '}
          <Link href="/license#proprietary-license">/license</Link> for the
          complete terms.
        </li>
      </ul>
    </section>
  );
};

export default LICENSE;
