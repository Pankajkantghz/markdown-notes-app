#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/05053735e8fd58350129e72911b6ce167762eb1f381441bc9349d170979a4192/contract';
import startContract from '../../snapshots/05053735e8fd58350129e72911b6ce167762eb1f381441bc9349d170979a4192/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/abf36bd2942b6af0e1486d7083822bbe73eaca3e41628fb8cccfd59bb5100b46/contract';
import endContract from '../../snapshots/abf36bd2942b6af0e1486d7083822bbe73eaca3e41628fb8cccfd59bb5100b46/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'Note',
        column: 'title',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
