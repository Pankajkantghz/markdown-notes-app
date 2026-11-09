#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/05053735e8fd58350129e72911b6ce167762eb1f381441bc9349d170979a4192/contract';
import endContract from '../../snapshots/05053735e8fd58350129e72911b6ce167762eb1f381441bc9349d170979a4192/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/253f7747a1195b4ec4d022348386654f023c33a4e2e476bb0641606544ec5915/contract';
import startContract from '../../snapshots/253f7747a1195b4ec4d022348386654f023c33a4e2e476bb0641606544ec5915/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropTable({ schema: 'public', table: 'User' }),
      this.createTable({
        schema: 'public',
        table: 'Note',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'Note_pkey' })],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
