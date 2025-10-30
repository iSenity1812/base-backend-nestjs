import { BaseCRUDService } from '@app/common';
import { Injectable } from '@nestjs/common';
import { OpenIdProviderEntity } from '../entities/openid-provider.entity';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

@Injectable()
export class OpenIdProviderService extends BaseCRUDService<OpenIdProviderEntity> {
  constructor(
    @InjectRepository(OpenIdProviderEntity)
    private readonly repo: Repository<OpenIdProviderEntity>,
  ) {
    super(repo);
  }

  async getEnabledProviders() {
    return this.repo.find({ where: { enabled: true } });
  }

  async findByName(name: string) {
    return this.repo.findOne({ where: { name, enabled: true } });
  }
}
