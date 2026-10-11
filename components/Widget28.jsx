'use client';
import { useState } from 'react';

// Module-unique code so the bundler keeps each widget in its own async chunk.
const TABLE = Array.from({ length: 200 }, (_, k) => 'widget-28-entry-' + k * 31);

export default function Widget28() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-widget="28" onClick={() => setCount(count + 1)}>
      {TABLE[count % TABLE.length]}
    </button>
  );
}
