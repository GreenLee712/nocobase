/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { ISchema, SchemaComponent, ExtendCollectionsProvider } from '@nocobase/client';
import { Card } from 'antd';
import { uid } from '@formily/shared';
import { tval } from '@nocobase/utils/client';
import { useAuthTranslation } from '../../locale';
import { hooksNameMap, hooksMap } from './hooks';
import { componentsMap, componentsNameMap } from './components';
import { SecurityAccessConfig } from '../../../types';

type Properties = {
  [K in keyof SecurityAccessConfig | 'footer']: any;
};
const schema: ISchema & { properties: Properties } = {
  name: uid(),
  'x-component': 'FormV2',
  'x-use-component-props': hooksNameMap.useEditForm,
  type: 'object',
  properties: {
    maxTokenLifetime: {
      type: 'string',
      title: "{{t('Login validity period')}}",
      'x-decorator': 'FormItem',
      'x-component': componentsNameMap.InputTime,
      required: true,
      description: tval(
        'Keep the login session active. If the session times out and the user attempts to access system features, the system will return a 401 error and redirect to the login page.',
      ),
    },
    tokenExpirationTime: {
      type: 'string',
      title: "{{t('Token validity period')}}",
      'x-decorator': 'FormItem',
      'x-component': componentsNameMap.InputTime,
      required: true,
      description: tval(
        'During the active login session, the system issues tokens with a defined validity period. If a token expires, a new one will be issued. For security reasons, it is recommended to set the validity period within a range of 15 to 30 minutes based on actual requirements.',
      ),
    },
    maxInactiveInterval: {
      type: 'string',
      title: "{{t('Page inactivity timeout')}}",
      'x-decorator': 'FormItem',
      'x-component': componentsNameMap.InputTime,
      required: true,
      description: tval(
        'After logging into the system, if the page remains inactive for a period exceeding this duration, the system will display a timeout prompt. Upon confirmation, the user will be redirected to the login page and will need to log in again to continue operations.',
      ),
    },
    footer: {
      type: 'void',
      'x-component': 'ActionBar',
      'x-component-props': {
        layout: 'one-column',
      },
      properties: {
        submit: {
          title: '{{t("Submit")}}',
          'x-component': 'Action',
          'x-use-component-props': hooksNameMap.useSubmitActionProps,
        },
      },
    },
  },
};

export const AccessSettings = () => {
  const { t } = useAuthTranslation();
  return (
    <Card bordered={false}>
      <SchemaComponent schema={schema} scope={{ t, ...hooksMap }} components={componentsMap}></SchemaComponent>
    </Card>
  );
};
