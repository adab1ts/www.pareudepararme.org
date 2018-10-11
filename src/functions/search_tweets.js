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
import twitter from 'twitter-text';
import moment from 'moment';


const { TW_API_ENDPOINT, TW_API_TOKEN } = process.env;


/**
 * 
 * @param {string} created_at 
 * @param {array} langs 
 */
function toShortDateString(created_at, langs = ['ca']) {
    return langs.reduce((formatted, lang) => {
        moment.locale(lang);

        return {
            ...formatted,
            [lang]: moment(created_at).format('LL')
        };
        // formatted[lang] = moment(created_at).format('LL');
        // formatted[lang] = moment(created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('LL');
    }, {});
}

/**
 * 
 * @param {array} statuses 
 */
function normalize (statuses) {
    return statuses.map(st => ({
        id_str: st.id_str,
        created_at: toShortDateString(st.created_at, ['ca', 'es']),
        text: encodeURIComponent(twitter.autoLink(st.text)),
        user: {
            name: st.user.name,
            screen_name: st.user.screen_name,
            profile_image_url_https: st.user.profile_image_url_https
        }
    }));
}


/**
 * 
 * @param {object} params 
 */
function buildQuery ({ hashtags = [], count = '20' }) {
    const query = {
        q: hashtags.map(ht => `#${ht}`).join(' OR '),
        count
    };
    
    return querystring.stringify(query);
}


/**
 * 
 * @example
 * curl -X POST "https://your-site-name.netlify.com/.netlify/functions/search_tweets" --data '{"hashtags":["pareudepararme","paraddepararme"]}'
 * 
 * @see
 * https://developer.twitter.com/en/docs/tweets/search/overview
 * https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets.html
 * https://developer.twitter.com/en/docs/tweets/search/api-reference/premium-search#Authentication
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

    return fetch(`${TW_API_ENDPOINT}?${query}`, {
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
        .then(({ statuses }) => normalize(statuses))
        .then(statuses => ({
            headers: { 'Access-Control-Allow-Origin': '*' },
            statusCode: 200,
            body: JSON.stringify({ statuses })
        }))
        .catch(error => ({
            statusCode: 422,
            body: `Oops! Something went wrong. ${error}`
        }));
};
