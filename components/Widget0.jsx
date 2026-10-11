'use client';
import { useState } from 'react';

// Module-unique code so the bundler keeps each widget in its own async chunk.
const TABLE = Array.from({ length: 200 }, (_, k) => 'widget-0-entry-' + k * 3);

export default function Widget0() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-widget="0" onClick={() => setCount(count + 1)}>
      {TABLE[count % TABLE.length]}
    </button>
  );
}
