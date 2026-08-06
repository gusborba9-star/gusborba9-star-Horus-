import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryGraph } from '../lib/memoryGraph.ts';

test('MemoryGraph compressContext deduplicates equivalent memory content and respects the bound', () => {
  const nodes = [
    { content: '  same   memory ', similarity: 0.99 },
    { content: 'same memory', similarity: 0.98 },
    { content: 'distinct memory', similarity: 0.97 },
    { content: 'third memory', similarity: 0.96 },
  ];

  const result = MemoryGraph.compressContext(nodes, 2);

  assert.equal(result.length, 2);
  assert.equal(result[0].content, '  same   memory ');
  assert.equal(result[1].content, 'distinct memory');
});

test('MemoryGraph compressContext preserves ordering from semantic retrieval', () => {
  const nodes = [
    { content: 'high relevance', similarity: 0.99 },
    { content: 'medium relevance', similarity: 0.90 },
    { content: 'low relevance', similarity: 0.81 },
  ];

  const result = MemoryGraph.compressContext(nodes, 3);

  assert.deepEqual(result.map((node) => node.content), [
    'high relevance',
    'medium relevance',
    'low relevance',
  ]);
});
