#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/926d14884ecb36cd21c85f4ec0f6523643f7c778a3f242012c5bdff8f38ecf55/contract';
import endContract from '../../snapshots/926d14884ecb36cd21c85f4ec0f6523643f7c778a3f242012c5bdff8f38ecf55/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/abf36bd2942b6af0e1486d7083822bbe73eaca3e41628fb8cccfd59bb5100b46/contract';
import startContract from '../../snapshots/abf36bd2942b6af0e1486d7083822bbe73eaca3e41628fb8cccfd59bb5100b46/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('avatar', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('googleId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'User_pkey' })],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Note',
        column: col('ownerId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_googleId_key',
        columns: ['googleId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Note',
        index: 'Note_ownerId_idx_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Note',
        foreignKey: {
          name: 'Note_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
