import { SetMetadata } from '@nestjs/common';
import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resources.enum';

export const RESOURCE_ACTION_KEY = 'resource_action';

export const RequireResourceAction = (action: Action, resource: Resource) =>
  SetMetadata(RESOURCE_ACTION_KEY, { action, resource });

export const RequireAnyResourceAction = (action: Action, resource: Resource) =>
  SetMetadata(RESOURCE_ACTION_KEY + '_ANY', { action, resource });

export const RequireAllResourceAction = (action: Action, resource: Resource) =>
  SetMetadata(RESOURCE_ACTION_KEY + '_ALL', { action, resource });

export const RequireResourceActions = (actions: Action[], resource: Resource) =>
  SetMetadata(RESOURCE_ACTION_KEY, { actions, resource });

export const RequireAnyResourceActions = (
  actions: Action[],
  resource: Resource,
) => SetMetadata(RESOURCE_ACTION_KEY + '_ANY', { actions, resource });

export const RequireAllResourceActions = (
  actions: Action[],
  resource: Resource,
) => SetMetadata(RESOURCE_ACTION_KEY + '_ALL', { actions, resource });
