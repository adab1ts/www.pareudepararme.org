/**
 * MIT License
 *
 * Copyright (c) 2018 Adab1ts
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import querystring from 'querystring';
import fetch from 'node-fetch';


const { NODE_ENV, TW_USERS_ENDPOINT, TW_API_TOKEN } = process.env;


/**
 * 
 * @param {object} params 
 */
function buildQuery ({ users = [] }) {
    const query = {
        screen_name: users.join(','),
        include_entities: false
    };
    
    return querystring.stringify(query);
}


/**
 * 
 * @param {array} users 
 */
function normalize (users) {
    // return users.map(user => ({
    //     id_str: user.id_str,
    //     name: user.name,
    //     screen_name: user.screen_name,
    //     profile_image_url_https: user.profile_image_url_https
    // }));
    return users.reduce((avatars, user) => {
        const screenName = user.screen_name.toLowerCase();
        avatars[screenName] = user.profile_image_url_https;

        return avatars;
    }, {});
}


/**
 * 
 * @example
 * curl -X POST "https://your-site-name.netlify.com/.netlify/functions/users_lookup" --data '{"users":["policia","mossos"]}'
 * 
 * @see
 * https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-users-lookup
 * https://developer.twitter.com/en/docs/basics/authentication/overview/application-only
 * 
 * @param {object} event 
 * @param {object} context 
 */
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const params = JSON.parse(event.body);
    const query = buildQuery(params);

    return fetch(`${TW_USERS_ENDPOINT}?${query}`, {
        headers: {
            'Authorization': `Bearer ${TW_API_TOKEN}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText)
            }
            return response.json()
        })
        .then(users => normalize(users))
        .then(avatars => {
            const response = {
                statusCode: 200,
                body: JSON.stringify({ avatars })
            };

            if (NODE_ENV === 'development') {
                return {
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    ...response
                };
            }
            
            return response;
        })
        .catch(error => ({
            statusCode: 422,
            body: `Oops! Something went wrong. ${error}`
        }));
};
