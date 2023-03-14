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

import assert from "assert";
import { describe, it } from "node:test";

process.env.PORT = '3000';

await import('../server.js');

describe('Oauth2', () => {
    it('should return 401 if no Authorization header is provided', async () => {
        const res = await fetch('http://localhost:3000/auth/user', {
            method: 'GET',
        });

        assert.equal(res.status, 401);
    });
});

describe('Bin', () => {
    describe('List All', () => {
        it('should return a list of all bins', async () => {
            const response = await fetch('http://localhost:3000/bin');
            assert(response.ok);
            const body = await response.json();
            assert(body.length > 0);
        });
    });

    describe('Create', () => {
        it('should create a bin', async () => {
            const response = await fetch('http://localhost:3000/bin', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'test',
                    description: 'test',
                    items: [],
                }),
            });
            assert(response.ok);
            const body = await response.json();
            assert(body.id);
        });
    });

    describe('Get', () => {
        it('should get a bin', async () => {
            const response = await fetch('http://localhost:3000/bin');
            assert(response.ok);
            const body = await response.json();
            const bin = body[0];
            const response2 = await fetch(`http://localhost:3000/bin/${bin.id}`);
            assert(response2.ok);
            const body2 = await response2.json();
            assert(body2.id === bin.id);
        });

        it('should return a 404 if the bin does not exist', async () => {
            const response = await fetch('http://localhost:3000/bin/a');
            assert(!response.ok);
            assert(response.status === 404);
        });
    });

    describe('Delete', () => {
        it('should delete a bin', async () => {
            const response = await fetch('http://localhost:3000/bin', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'test',
                    description: 'test',
                    items: [],
                }),
            });
            assert(response.ok);
            const body = await response.json();
            assert(body.id);
            const response2 = await fetch(`http://localhost:3000/bin/${body.id}`, {
                method: 'DELETE',
            });
            assert(response2.ok);
        });
    });
});
