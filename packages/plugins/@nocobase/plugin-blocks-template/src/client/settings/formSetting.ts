/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  APIClient,
  SchemaSettingsItemType,
  useAPIClient,
  useCollection,
  useCollectionManager,
  useCurrentPopupRecord,
  useDesignable,
  useLocalVariables,
} from '@nocobase/client';
import { useT } from '../locale';
import { useField, useFieldSchema } from '@formily/react';
import _ from 'lodash';
import { uid } from '@nocobase/utils/client';
import { Schema } from '@nocobase/utils';

async function schemaPatch(
  currentSchema: Schema,
  options: {
    api: APIClient;
    // collectionName: string;
    // dataSource: string;
    option: string;
  },
) {
  const { option, api } = options;
  const schema = {
    ['x-uid']: currentSchema['x-uid'],
  };

  const comKey = Object.keys(currentSchema.properties)[0];
  const actionKey = Object.keys(currentSchema['properties'][comKey]['properties']).find((key) => {
    return currentSchema['properties'][comKey]['properties'][key]['x-initializer'].includes('configureActions');
  });
  const newActionBarSchemas = {};

  if (option === 'Edit') {
    schema['x-decorator-props'] = {
      action: 'get',
      ...currentSchema['x-decorator-props'],
    };
    schema['x-acl-action'] = currentSchema['x-acl-action'].replace(':create', ':update');
    schema['x-settings'] = 'blockSettings:editForm';
    schema['x-use-decorator-props'] = 'useEditFormBlockDecoratorProps';
    schema['properties'] = {
      [comKey]: {
        'x-uid': currentSchema.properties[comKey]['x-uid'],
        'x-use-component-props': 'useEditFormBlockProps',
        properties: {
          [actionKey]: {
            'x-uid': currentSchema.properties[comKey]['properties'][actionKey]['x-uid'],
            'x-initializer': 'editForm:configureActions',
            properties: newActionBarSchemas,
          },
        },
      },
    };
    const actionBarSchema = currentSchema['properties'][comKey]['properties'][actionKey];
    for (const key in actionBarSchema.properties) {
      if (actionBarSchema.properties[key]['x-settings'].includes('createSubmit')) {
        newActionBarSchemas[key] = {};
        newActionBarSchemas[key]['x-settings'] = 'actionSettings:updateSubmit';
        newActionBarSchemas[key]['x-use-component-props'] = 'useUpdateActionProps';
        newActionBarSchemas[key]['x-uid'] = actionBarSchema.properties[key]['x-uid'];
      }
    }
  } else {
    schema['x-decorator-props'] = {
      ...currentSchema['x-decorator-props'],
      action: undefined,
    };
    schema['x-acl-action'] = currentSchema['x-acl-action'].replace(':update', ':create');
    schema['x-settings'] = 'blockSettings:createForm';
    schema['x-use-decorator-props'] = 'useCreateFormBlockDecoratorProps';
    schema['properties'] = {
      [comKey]: {
        'x-uid': currentSchema.properties[comKey]['x-uid'],
        'x-use-component-props': 'useCreateFormBlockProps',
        properties: {
          [actionKey]: {
            'x-uid': currentSchema.properties[comKey]['properties'][actionKey]['x-uid'],
            'x-initializer': 'createForm:configureActions',
            properties: newActionBarSchemas,
          },
        },
      },
    };
    const actionBarSchema = currentSchema['properties'][comKey]['properties'][actionKey];
    for (const key in actionBarSchema.properties) {
      if (actionBarSchema.properties[key]['x-settings'].includes('updateSubmit')) {
        newActionBarSchemas[key] = {};
        newActionBarSchemas[key]['x-settings'] = 'actionSettings:createSubmit';
        newActionBarSchemas[key]['x-use-component-props'] = 'useCreateActionProps';
        newActionBarSchemas[key]['x-uid'] = actionBarSchema.properties[key]['x-uid'];
      }
    }
  }
  return schema;
}

export const formSettingItem: SchemaSettingsItemType = {
  name: 'template-form',
  type: 'select',
  useVisible() {
    const fieldSchema = useFieldSchema();
    const decorator = fieldSchema['x-decorator'];
    const templateBlock = _.get(fieldSchema, 'x-template-uid');
    if (!templateBlock) {
      return false;
    }
    if (decorator === 'FormBlockProvider') {
      return true;
    }
    return false;
  },
  useComponentProps() {
    const t = useT();
    const fieldSchema = useFieldSchema();
    const field = useField();
    const api = useAPIClient();
    const { dn, refresh } = useDesignable();
    const currentCollection = useCollection();
    const currentPopupRecord = useCurrentPopupRecord();
    const cm = useCollectionManager();
    const currentOption =
      fieldSchema['x-use-decorator-props'] === 'useEditFormBlockDecoratorProps' ? 'Edit' : 'Add new';
    const options = ['Add new', 'Edit'];

    return {
      title: t('Form type'),
      value: currentOption,
      options: options.map((v) => ({ value: v })),
      onChange: async (option) => {
        const schema = await schemaPatch(fieldSchema, {
          api,
          // collectionName: currentCollectionName,
          // dataSource: decoratorProps.dataSource,
          option,
        });
        _.merge(fieldSchema, schema);
        field.decoratorProps = {
          ...fieldSchema['x-decorator-props'],
          ...schema['x-decorator-props'],
          key: uid(),
        };
        const schemaJSON = fieldSchema.toJSON();
        fieldSchema.toJSON = () => {
          const ret = _.merge(schemaJSON, schema);
          return ret;
        };
        await api.request({
          url: `/uiSchemas:patch`,
          method: 'post',
          data: {
            ...schema,
          },
        });

        refresh({
          refreshParentSchema: true,
        });
      },
    };
  },
};
