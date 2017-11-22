---
layout: script
---
{% capture api %}{% if jekyll.environment == "production" %}manifesto-api-sos{% else %}manifesto-api-staging{% endif %}{% endcapture %}
Vue.use(VeeValidate);
Vue.http.options.root = 'https://{{api}}.herokuapp.com/api';

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
      }, 3500);
    }
  },
  watch: {
    status: function(newStatus) {
      switch (true) {
        case newStatus === 0:
          this.messages.invalid = false;
          this.messages.errorInvalid = false;
          this.messages.error = false;
          this.messages.success = false;
          break;
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
      loading: false
    };
  },
  methods: {
    fetchSigners: function() {
      this.loading = true;

      this.$http
        .get('Signers')
        .then(function (res) {
          this.signers = res.data;
        }, function (err) {
          console.log(err);
        })
        .then(function() {
          this.loading = false;
        })
      ;
    }
  },
  created: function() {
    var vm = this;
    bus.$on('sign-sent', function() {
      vm.fetchSigners();
    });
  },
  mounted: function() {
    this.fetchSigners();
  }
});
