import { register } from 'node:module';

register('./resolve-alias.mjs', { parentURL: import.meta.url });
