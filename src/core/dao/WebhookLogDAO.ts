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

import { PrismaDTO, prisma } from "@core/lib/Prisma.js";
import { WebhookLog } from "@core/entity/WebhookLog.js";
import { Prisma } from "@prisma/client";

export default class WebhookLogDAO {
    static async all(args?: PrismaDTO.WebhookLogFindManyArgs): Promise<WebhookLog[]> {
        return await prisma.webhookLog.findMany(args);
    }

    static async create(data: PrismaDTO.WebhookLogCreateInput): Promise<WebhookLog> {
        return await prisma.webhookLog.create({
            data
        });
    }

    static async get(args: PrismaDTO.WebhookLogFindFirstArgs): Promise<WebhookLog | null> {
        return await prisma.webhookLog.findFirst(args);
    }

    static async save(id: string, data: PrismaDTO.WebhookLogUpdateInput): Promise<WebhookLog> {
        return await prisma.webhookLog.update({
            where: {
                id
            },
            data
        });
    }

    static async delete(id: string): Promise<WebhookLog> {
        return await prisma.webhookLog.delete({
            where: {
                id
            }
        });
    }
}
