'use client';
import { useState } from 'react';

// Module-unique code so the bundler keeps each widget in its own async chunk.
const TABLE = Array.from({ length: 200 }, (_, k) => 'widget-20-entry-' + k * 23);

export default function Widget20() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-widget="20" onClick={() => setCount(count + 1)}>
      {TABLE[count % TABLE.length]}
    </button>
  );
}
