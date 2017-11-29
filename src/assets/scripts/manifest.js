---
layout: script
---
{% capture api %}{% if jekyll.environment == "production" %}manifesto-api-sos{% else %}manifesto-api-staging{% endif %}{% endcapture %}
Vue.http.options.root = 'https://{{api}}.herokuapp.com/api';
{% raw %}
Vue.use(VeeValidate);

var bus = new Vue();

var manifesto = new Vue({
  el: '#manifesto',
  data: function() {
    return {
      signer: {},
      accepted: false,
      sending: false,
      status: 0,
      messages: {
        invalid: false,
        errorInvalid: false,
        error: false,
        success: false
      }
    }
  },
  methods: {
    validate: function() {
      var vm = this;
      this.$validator.validateAll().then(function(valid) {
        if (valid) {
          vm.sign();
        } else {
          vm.messages.invalid = true;
          vm.hideMessages();
        }
      });
    },
    sign: function() {
      this.sending = true;

      this.$http
        .post('Signers', this.signer)
        .then(function (res) {
          this.resetForm();
          this.status = res.status;
          bus.$emit('sign-sent');
        }, function(err) {
          console.log(err);
          this.status = err.status;
        })
        .then(function () {
          this.sending = false;
          this.hideMessages();
        })
      ;
    },
    resetForm: function() {
      this.signer = {};
      this.accepted = false;
    },
    hideMessages: function() {
      var vm = this;
      setTimeout(function () {
        vm.status = 0;
        vm.messages.invalid = false;
        vm.messages.errorInvalid = false;
        vm.messages.error = false;
        vm.messages.success = false;
      }, 3500);
    }
  },
  watch: {
    status: function(newStatus) {
      switch (true) {
        case newStatus === 200:
          this.messages.success = true;
          break;
        case newStatus === 422:
          this.messages.errorInvalid = true;
          break;
        case newStatus >= 500:
          this.messages.error = true;
          break;
        default:
          console.log(newStatus);
      }
    }
  }
});

var signers = new Vue({
  el: '#signers',
  data: function() {
    return {
      signers: [],
      total: 0,
      paged: 20,
      currPage: 1
    };
  },
  computed: {
    pages: function() {
      return Math.ceil(this.total / this.paged);
    }
  },
  methods: {
    fetchTotal: function() {
      this.$http
        .get('Signers/count')
        .then(function (res) {
          this.total = res.data.count;
        }, function (err) {
          console.log(err);
        })
      ;
    },
    fetchSigners: function(page) {
      var offset = this.paged * (page - 1);

      this.$http
        .get('Signers?filter[offset]=' + offset)
        .then(function (res) {
          this.signers = res.data;
          this.currPage = page;
        }, function (err) {
          console.log(err);
        })
      ;
    }
  },
  created: function() {
    var vm = this;
    bus.$on('sign-sent', function() {
      vm.fetchTotal();
      vm.fetchSigners(this.currPage);
    });
  },
  mounted: function() {
    this.fetchTotal();
    this.fetchSigners(this.currPage);
  }
});
{% endraw %}
