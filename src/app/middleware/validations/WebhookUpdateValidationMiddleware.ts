/**
 * Copyright 2022 Dhiego Cassiano Fogaça Barbosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ValidationMiddleware } from "midori/middlewares";
import { ValidatonRules } from "midori/util/validation.js";

export default class WebhookUpdateValidationMiddleware extends ValidationMiddleware {
    get rules(): ValidatonRules {
        return {
            url: {
                type: 'string',
                required: true,
                nullable: false,
            },
            method: {
                type: 'string',
                required: true,
                nullable: false,
            },
            headers: {
                type: 'object',
                required: false,
                nullable: true,
                customValidations: [{
                    validator: (value: Record<string, any>) => Object.values(value).every(v => typeof v === 'string'),
                    message: "expected an object with string values",
                }],
            },
            body: {
                type: 'string',
                required: false,
                nullable: true,
            },
        };
    }
}
