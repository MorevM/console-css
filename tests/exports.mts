import { expectTypeOf } from 'vitest';
import esm from '@morev/console-css';

type CommonJS = typeof import('@morev/console-css', { with: { 'resolution-mode': 'require' } });

expectTypeOf(esm.styled).toEqualTypeOf<Console>();
expectTypeOf(esm.add).toEqualTypeOf<(rules: string) => void>();
expectTypeOf<CommonJS['styled']>().toEqualTypeOf<Console>();
expectTypeOf<CommonJS['add']>().toEqualTypeOf<typeof esm.add>();
