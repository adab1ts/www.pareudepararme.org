Vue.use(VeeValidate);
Vue.http.options.root = 'https://jsonplaceholder.typicode.com';

var bus = new Vue();

var manifesto = new Vue({
  el: '#manifesto',
  data: function() {
    return {
      signer: {},
      accepted: false,
      sending: false,
      messages: {
        success: false,
        error: false,
        invalid: false
      }
    }
  },
  methods: {
    validate: function() {
      console.log(this.errors);
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
      console.log(this.signer);
      this.sending = true;

      this.$http
        .post('users', this.signer)
        .then(function (res) {
          console.log(res);
          this.resetForm();
          this.messages.success = true;
          bus.$emit('sign-sent');
        }, function(err) {
          console.log(err);
          this.messages.error = true;
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
        vm.messages = {
          success: false,
          error: false,
          invalid: false
        }
      }, 3000);
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
        .get('users')
        .then(function (res) {
          console.log(res.data);
          this.signers = res.data;
          this.loading = false;
        }, function (err) {
          console.log(err);
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
