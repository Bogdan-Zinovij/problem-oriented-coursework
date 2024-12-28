import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionsTable1620219378020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO regions (name, geocode) VALUES 
            ('Вінницька область', 'UA-05'),
            ('Волинська область', 'UA-07'),
            ('Дніпропетровська область', 'UA-12'),
            ('Донецька область', 'UA-14'),
            ('Житомирська область', 'UA-18'),
            ('Закарпатська область', 'UA-21'),
            ('Запорізька область', 'UA-23'),
            ('Івано-Франківська область', 'UA-26'),
            ('Київська область', 'UA-32'),
            ('Кіровоградська область', 'UA-35'),
            ('Луганська область', 'UA-44'),
            ('Львівська область', 'UA-46'),
            ('Миколаївська область', 'UA-48'),
            ('Одеська область', 'UA-51'),
            ('Полтавська область', 'UA-53'),
            ('Рівненська область', 'UA-56'),
            ('Сумська область', 'UA-59'),
            ('Тернопільська область', 'UA-61'),
            ('Харківська область', 'UA-63'),
            ('Херсонська область', 'UA-65'),
            ('Хмельницька область', 'UA-68'),
            ('Черкаська область', 'UA-71'),
            ('Чернівецька область', 'UA-73'),
            ('Чернігівська область', 'UA-74'),
            ('АР Крим', 'UA-43'),
            ('Київ', 'UA-30'),
            ('Севастополь', 'UA-40');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM regions`);
  }
}
