import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInitialTables1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'orderType', type: 'enum', enum: ['VIP', 'NORMAL'], default: "'NORMAL'" },
          { name: 'status', type: 'enum', enum: ['PENDING', 'ASSIGNED', 'PROCESSING', 'COMPLETE', 'FAILED'], default: "'PENDING'" },
          { name: 'payload', type: 'text', isNullable: true },
          { name: 'priority', type: 'int', default: 1 },
          { name: 'created_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', default: 'NOW()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'bots',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'name', type: 'varchar', length: '100', isUnique: true },
          { name: 'active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', default: 'NOW()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'bot_jobs',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'order_id', type: 'int', isNullable: false },
          { name: 'bot_id', type: 'int', isNullable: true },
          { name: 'status', type: 'enum', enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'], default: "'QUEUED'" },
          { name: 'queued_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'started_at', type: 'timestamptz', isNullable: true },
          { name: 'completed_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'bot_jobs',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bot_jobs',
      new TableForeignKey({
        columnNames: ['bot_id'],
        referencedTableName: 'bots',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bot_jobs');

    if (table) {
      const foreignKeyOrder = table.foreignKeys.find((fk) => fk.columnNames.includes('order_id'));
      const foreignKeyBot = table.foreignKeys.find((fk) => fk.columnNames.includes('bot_id'));

      if (foreignKeyOrder) {
        await queryRunner.dropForeignKey('bot_jobs', foreignKeyOrder);
      }
      if (foreignKeyBot) {
        await queryRunner.dropForeignKey('bot_jobs', foreignKeyBot);
      }
    }

    await queryRunner.dropTable('bot_jobs', true);
    await queryRunner.dropTable('bots', true);
    await queryRunner.dropTable('orders', true);
  }
}
