import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IEventDto } from '@project/globals';

@Entity()
export class Event implements IEventDto {
  /*
    NOTE:
    Constructor is private to accidental manual creation of entities.
    They should be created with repository api.
  */
  // eslint-disable-next-line
  private constructor() {}

  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column({ type: 'date' })
  date!: string;
}
