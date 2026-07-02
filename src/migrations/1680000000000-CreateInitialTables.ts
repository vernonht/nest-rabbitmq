import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInitialTables1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          {
            name: 'orderType',
            type: 'enum',
            enum: ['VIP', 'NORMAL'],
            default: "'NORMAL'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'ASSIGNED', 'PROCESSING', 'COMPLETE', 'FAILED'],
            default: "'PENDING'",
          },
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bots', true);
    await queryRunner.dropTable('orders', true);
  }
}
