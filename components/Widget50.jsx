'use client';
import { useState } from 'react';

// Module-unique code so the bundler keeps each widget in its own async chunk.
const TABLE = Array.from({ length: 200 }, (_, k) => 'widget-50-entry-' + k * 53);

export default function Widget50() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-widget="50" onClick={() => setCount(count + 1)}>
      {TABLE[count % TABLE.length]}
    </button>
  );
}
