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

var bus = new Vue();


var mediator = new Vue({
    el: '#targets',
    data: {
        loading: false,
        error: false,
        count: 0,
        users: []
    },
    computed: {
        targetsCount: function () {
            return this.$el.dataset.targetsCount;
        },
        apiEndpoint: function () {
            return this.$el.dataset.endpoint;
        }
    },
    created: function () {
        var vm = this;
        bus.$on('fetch-avatars', function (users) {
            vm.users = vm.users.concat(users);
            vm.count++;
        })
    },
    watch: {
        count: function (newValue) {
            if (newValue == this.targetsCount) {
                bus.$off('fetch-avatars');
                this.fetchAvatars();
            }
        }
    },
    methods: {
        fetchAvatars: function () {
            var vm = this;
            
            vm.error = false;
            vm.loading = true;
    
            fetch(vm.apiEndpoint, {
                method: 'POST',
                body: JSON.stringify({ users: vm.users })
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }
                    return response.json();
                })
                .then(function (data) {
                    vm.loading = false;
                    bus.$emit('avatars-fetched', data.avatars);
                })
                .catch(function (error) {
                    console.log(error);
                    vm.loading = false;
                    vm.error = true;
                });
        }
    }
});


var target = {
    computed: {
        childNodes: function () {
            return Array.from(this.$el.querySelectorAll('[data-screen_name]'));
        },
        users: function () {
            return this.childNodes.map(function (node) { return node.dataset.screen_name; });
        }
    },
    created: function () {
        var vm = this;
        bus.$on('avatars-fetched', function (avatars) {
            vm.setAvatars(avatars);
            bus.$off('avatars-fetched');
        });
    },
    mounted: function () {
        bus.$emit('fetch-avatars', this.users);
    },
    methods: {
        setAvatars: function (fetchedAvatars) {
            this.childNodes.forEach(function (node) {
                var screenName = node.dataset.screen_name.toLowerCase();

                var img = node.querySelector('img');
                img.src = fetchedAvatars[screenName];
            });
        }
    }
}


var institutions = new Vue({
    el: '#institucions',
    mixins: [target]
});


var society = new Vue({
    el: '#societat-civil',
    mixins: [target]
});


var influencers = new Vue({
    el: '#personalitats',
    mixins: [target]
});


var journalists = new Vue({
    el: '#periodistes',
    mixins: [target]
});