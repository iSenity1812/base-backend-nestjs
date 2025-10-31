import { BaseEntity } from '@app/common';
import { UserRole, UserStatus } from '@app/common/enums';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'users',
})
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: UserRole.BASIC, enum: UserRole, type: 'enum' })
  role: UserRole;

  @Column({ default: UserStatus.ACTIVE, enum: UserStatus, type: 'enum' })
  status: UserStatus;

  @Column('tsvector', { select: false, nullable: true })
  documentWithWeights: string;
}
