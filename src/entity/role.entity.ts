import { dateTimeTransformer } from '../common/transformers/date-time.transformer';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RoleHasPermission } from './role_has_permission.entity';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    status: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', transformer: dateTimeTransformer })
    created_at: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        transformer: dateTimeTransformer,
    })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @OneToMany(() => RoleHasPermission, (roleHasPermission) => roleHasPermission.role)
    roleHasPermissions: RoleHasPermission[];
}
