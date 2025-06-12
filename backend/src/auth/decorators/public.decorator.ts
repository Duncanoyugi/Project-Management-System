import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
export const IsNotPublic = () => SetMetadata(IS_PUBLIC_KEY, false);
export const IsPublicEndpoint = () => SetMetadata(IS_PUBLIC_KEY, true);
export const IsNotPublicEndpoint = () => SetMetadata(IS_PUBLIC_KEY, false);
export const IsPublicRoute = () => SetMetadata(IS_PUBLIC_KEY, true);
export const IsNotPublicRoute = () => SetMetadata(IS_PUBLIC_KEY, false);
