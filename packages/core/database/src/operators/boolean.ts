/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Op } from 'sequelize';

export default {
  $isFalsy(value) {
    if (value === true || value === 'true') {
      return {
        [Op.or]: {
          [Op.is]: null,
          [Op.eq]: false,
        },
      };
    }
    return {
      [Op.eq]: true,
    };
  },

  $isTruly(value) {
    if (value === false || value === 'false') {
      return {
        [Op.eq]: true,
      };
    }
    return {
      [Op.or]: {
        [Op.is]: null,
        [Op.eq]: false,
      },
    };
  },
} as Record<string, any>;
