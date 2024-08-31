import { dateTimeTransformer } from '../common/transformers/date-time.transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RoleLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    action: string;

    @Column()
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', transformer: dateTimeTransformer })
    created_at: Date;

    @Column()
    created_by: number;
}
