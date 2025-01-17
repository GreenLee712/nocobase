/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export const PluginName = 'event';
export const SchemaSettingsKey = 'x-event-settings';
export const SchemaDefinitionsKey = 'x-event-definitions';

export interface EventParam {
  name?: string; // 在item 情况下没有name https://json-schema.org/understanding-json-schema/reference/array
  title?: string;
  description?: string;
  type: string;
  properties?: {
    [key: string]: EventParam;
  };
  items?: EventParam;
}

/** 事件动作 */
export interface EventAction {
  name: string;
  title: string;
  description?: string;
  params?: {
    [key: string]: EventParam;
  };
  fn: (params?: any) => void;
}

/** 事件事件 */
export interface EventEvent {
  name: string;
  title: string;
  uid?: string;
  description?: string;
  params?: {
    [key: string]: EventParam;
  };
}

/** 事件定义 */
export interface EventDefinition {
  name: string;
  /** 标识同一类型组件的不同实例 */
  uid?: string;
  title: string;
  description?: string;
  events?: EventEvent[];
  states?: {
    [key: string]: EventParam;
  };
  actions?: EventAction[];
}

/** 事件设置 */
export interface EventSetting {
  event: string;
  /** 标识同一类型组件的不同实例 */
  uid?: string;
  condition: string;
  actions: string[];
}
