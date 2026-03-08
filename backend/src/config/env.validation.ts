import { IsString, IsNumber, IsOptional } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);
  return validatedConfig;
}