import { BaseEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'openid_providers' })
export class OpenIdProviderEntity extends BaseEntity {
  @Column({ unique: true })
  name: string; // 'google', 'azure', 'keycloak', etc.

  @Column({ nullable: true })
  issuer_url: string;

  @Column({ nullable: true })
  client_id: string;

  @Column({ nullable: true })
  client_secret: string;

  @Column({ nullable: true })
  redirect_uri: string;

  @Column({ default: true })
  enabled: boolean;

  @Column()
  display_name: string;

  @Column({ nullable: true })
  icon_url: string;
}
