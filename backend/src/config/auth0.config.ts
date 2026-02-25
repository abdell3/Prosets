import { ConfigService } from './config.service';

export const getAuth0Config = (configService: ConfigService) => ({
  domain: configService.auth0Domain,
  audience: configService.auth0Audience,
  issuer: configService.auth0IssuerBaseUrl,
});
