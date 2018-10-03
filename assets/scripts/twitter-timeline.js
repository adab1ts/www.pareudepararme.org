new Vue({
    el: '#twitter-timeline',
    data: function() {
        return {
            loading: false,
            tweets: []
        };
    },
    mounted: function() {
        this.fetchTimeline();
    },
    computed: {
        feedQuery: function () {
            var query = this.$el.dataset.hashtags
                .split(',')
                .map(function (ht) { return '#' + ht; })
                .join(' OR ');
            return 'https://twitter.com/search?f=tweets&q=' + encodeURIComponent(query);
        }
    },
    methods: {
        fetchTimeline: function() {
            this.loading = true;

            this.tweets = [
                {
                    created_at: "Tue Oct 02 10:41:40 +0000 2018",
                    id_str: "1047074128040288256",
                    text: "@centre_IRIDIA @SOSRacis Interessant i útil la guia “Pareu de parar-me” per saber com actuar davant les identificac… https://t.co/itPNBCrYfz",
                    user: {
                        name: "OJ del Pallars Sobirà",
                        screen_name: "sobirajove",
                        profile_image_url_https: "https://pbs.twimg.com/profile_images/591117297135308801/7bQ-S0TB_normal.jpg"
                    }
                },
                {
                    created_at: "Tue Oct 02 10:41:40 +0000 2018",
                    id_str: "1047074128040288256",
                    text: "@centre_IRIDIA @SOSRacis Interessant i útil la guia “Pareu de parar-me” per saber com actuar davant les identificac… https://t.co/itPNBCrYfz",
                    user: {
                        name: "OJ del Pallars Sobirà",
                        screen_name: "sobirajove",
                        profile_image_url_https: "https://pbs.twimg.com/profile_images/591117297135308801/7bQ-S0TB_normal.jpg"
                    }
                },
                {
                    created_at: "Tue Oct 02 10:41:40 +0000 2018",
                    id_str: "1047074128040288256",
                    text: "@centre_IRIDIA @SOSRacis Interessant i útil la guia “Pareu de parar-me” per saber com actuar davant les identificac… https://t.co/itPNBCrYfz",
                    user: {
                        name: "OJ del Pallars Sobirà",
                        screen_name: "sobirajove",
                        profile_image_url_https: "https://pbs.twimg.com/profile_images/591117297135308801/7bQ-S0TB_normal.jpg"
                    }
                },
                {
                    created_at: "Tue Oct 02 10:41:40 +0000 2018",
                    id_str: "1047074128040288256",
                    text: "@centre_IRIDIA @SOSRacis Interessant i útil la guia “Pareu de parar-me” per saber com actuar davant les identificac… https://t.co/itPNBCrYfz",
                    user: {
                        name: "OJ del Pallars Sobirà",
                        screen_name: "sobirajove",
                        profile_image_url_https: "https://pbs.twimg.com/profile_images/591117297135308801/7bQ-S0TB_normal.jpg"
                    }
                }
            ];

            this.loading = false;

            // var vm = this;
            // axios
            //     .get('https://jsonplaceholder.typicode.com/todos')
            //     .then(function (response) {
            //         vm.tweets = response.data;
            //         vm.loading = false;
            //     });
        },
        autoLink: function (status) {
            return twttr.txt.autoLink(status);
        }
    },
    filters: {
        shortStringDate: function (date, lang) {
            moment.locale(lang);
            // return moment(date, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('LL');
            return moment(date).format('LL');
        }
    }
});
