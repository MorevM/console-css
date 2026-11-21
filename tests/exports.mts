import { expectTypeOf } from 'vitest';
import esm from '@morev/console-css';
import cjs = require('@morev/console-css');

expectTypeOf(esm.styled).toEqualTypeOf<Console>();
expectTypeOf(esm.add).toEqualTypeOf<(rules: string) => void>();
expectTypeOf(cjs.styled).toEqualTypeOf<Console>();
expectTypeOf(cjs.add).toEqualTypeOf<typeof esm.add>();
