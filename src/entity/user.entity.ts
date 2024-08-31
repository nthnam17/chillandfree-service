import { dateTimeTransformer } from '../common/transformers/date-time.transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    remember_token: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    image: string;

    @Column({ default: 0 })
    status: number;

    @Column({ nullable: true })
    role_id: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', transformer: dateTimeTransformer })
    created_at: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        transformer: dateTimeTransformer,
    })
    updated_at: Date;

    @Column()
    created_by: number;

    @Column()
    updated_by: number;
}
