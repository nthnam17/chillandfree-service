import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity()
export class RoleHasPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role_id: number;

    @Column()
    permission_id: number;

    @ManyToOne(() => Role, (role) => role.roleHasPermissions)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Permission, (permission) => permission.roleHasPermissions)
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;
}
