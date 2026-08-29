/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const ehrChainCode = require('./lib/ehrChainCode');

module.exports.ehrChainCode = ehrChainCode;
module.exports.contracts = [ehrChainCode];