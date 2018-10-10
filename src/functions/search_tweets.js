import fetch from 'node-fetch';
import twitter from 'twitter-text';
import moment from 'moment';
import 'moment/locale/ca';
import 'moment/locale/es';


const { TW_API_ENDPOINT, TW_API_TOKEN } = process.env;

function toShortDateString(created_at, langs) {
    return langs.reduce((parsed, lang) => {
        moment.locale(lang);
        parsed[lang] = moment(created_at).format('LL');
        // parsed[lang] = moment(created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('LL');

        return parsed;
    }, {});
}

function normalize (statuses) {
    return statuses.map(st => ({
        id: st.id_str,
        created_at: toShortDateString(st.created_at, ['ca', 'es']),
        text: twitter.autoLink(st.text),
        user: {
            name: st.user.name,
            screen_name: st.user.screen_name,
            avatar_url: st.user.profile_image_url_https
        }
    }));
}

exports.handler = async (event, context) => {
    const query = 'q=%23pareudepararme&count=20';
    const options = {
        headers: {
            Authorization: `Bearer ${TW_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        compress: true
    };

    return fetch(`${TW_API_ENDPOINT}?${query}`, options)
        .then(response => response.json())
        .then(({ statuses }) => normalize(statuses))
        .then(tweets => ({
            statusCode: 200,
            body: JSON.stringify(tweets)
        }))
        .catch(error => ({ statusCode: 422, body: String(error) }));
};