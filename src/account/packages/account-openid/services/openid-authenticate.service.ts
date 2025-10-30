import { Issuer, generators } from 'openid-client';

import { BadRequestException, Injectable } from '@nestjs/common';

import { OpenIdProviderService } from './openid-provider.service';

@Injectable()
export class OpenIdAuthenticateService {
  constructor(private readonly providersService: OpenIdProviderService) {}

  // In-memory store for PKCE/state for demo purposes. For production, use a persistent store.
  private stateStore = new Map<
    string,
    { code_verifier: string; nonce: string }
  >();

  async getProviders() {
    return this.providersService.getEnabledProviders();
  }

  async getAuthorizationUrl(providerName: string) {
    const conf = await this.providersService.findByName(providerName);
    if (!conf) throw new BadRequestException('Provider not found');

    const issuer = await Issuer.discover(conf.issuer_url);
    const client = new issuer.Client({
      client_id: conf.client_id,
      client_secret: conf.client_secret,
      redirect_uris: [conf.redirect_uri],
      response_types: ['code'],
    });

    const state = generators.state();
    const nonce = generators.nonce();
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    this.stateStore.set(state, { code_verifier, nonce });

    return client.authorizationUrl({
      scope: 'openid profile email',
      state,
      nonce,
      code_challenge,
      code_challenge_method: 'S256',
    });
  }

  async handleCallback(providerName: string, params: any) {
    console.log('handle callback', {
      providerName,
      params,
    });
    const conf = await this.providersService.findByName(providerName);
    if (!conf) throw new BadRequestException('Provider not found');

    const state = params.state;
    const stored = this.stateStore.get(state);
    if (!stored) throw new BadRequestException('Invalid state');

    const issuer = await Issuer.discover(conf.issuer_url);
    const client = new issuer.Client({
      client_id: conf.client_id,
      client_secret: conf.client_secret,
      redirect_uris: [conf.redirect_uri],
      response_types: ['code'],
    });

    const tokenSet = await client.callback(conf.redirect_uri, params, {
      state: params.state,
      nonce: stored.nonce,
      code_verifier: stored.code_verifier,
    } as any);

    return {
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      refreshId: tokenSet.refresh_token, // reuse refresh token as ID
      expiresIn: tokenSet.expires_in,
      idToken: tokenSet.id_token,
      claims: tokenSet.claims(),
    };
  }
}
