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

new Vue({
    el: '#twitter-timeline',
    data: function () {
        return {
            loading: false,
            error: false,
            tweets: []
        };
    },
    mounted: function () {
        var apiEndpoint = this.$el.dataset.apiEndpoint;
        var vm = this;
        
        vm.error = false;
        vm.loading = true;

        fetch(apiEndpoint, {
            method: 'POST',
            body: JSON.stringify({ hashtags: vm.hashtags })
        })
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText)
                }
                return response.json();
            })
            .then(function (data) {
                vm.tweets = data.statuses;
                vm.loading = false;
            })
            .catch(function (error) {
                console.log(error);
                vm.loading = false;
                vm.error = true;
            });
    },
    computed: {
        hashtags: function () {
            var hts = this.$el.dataset.hashtags || '';
            return hts.split(',');
        },
        feedQuery: function () {
            var query = this.hashtags
                .map(function (ht) { return '#' + ht; })
                .join(' OR ');
            
            return 'https://twitter.com/search?f=tweets&q=' + encodeURIComponent(query);
        }
    }
});
