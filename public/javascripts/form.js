/**
	Javascript form handler
	jQuery >= 1.10 is required
*/
	var FormHandlers = FormHandlers || {};

	var Form = function ( options ) {

		this.formObject = null; // jquery form object
		this.id = null; //form id
		this.method = 'GET'; // form method
		this.action = null; //form action
		this.valid = true; // form status
		this.rules = null; // validation rules
		this.error = '';
		this.data = {}; // unserialized form data
		this.errorFields = {}; // errorfields
		this.type = 'json';

		this.before = function () {}; // call this before send
		this.after = function () {}; // call this after send
		this.success = function () {}; // success request handler
		this.fails = function () {}; // if form is not valid

		this.init( options );
	};

	// validation types
	Form.prototype.types = {
		alpha: function (value) {
			return /^[A-ZА-Я_\- ]+$/i.test(value);
		},
		alphanum: function (value) {
			return true;
		},
		int : function (n) {
			return n == parseInt(n, 10);
		},
		float : function (n) {
 			return n == parseFloat(n, 10);
		},
		email : function (value) {
			var regexp = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return regexp.test(value);
		},
		url : function (value) {
			var regexp = /^https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_|]/;
			return regexp.test(value);
		},
		required : function (value) {
			return value == null || value == '' ? false : true;
		},
		length : function (value, data) {
			var len = value.length, min = data[0], max = data[1];
			return (len >= min && len <= max) ? true : false;
		},
		max : function (value, lim) {
			return value <= lim ? true : false;
		},
		min : function (value, lim) {
			return value >= lim ? true : false;
		},
		regexp : function (value, regexp) {
			return regexp.test(value);
		},
		eq: function(value, need, iam) {
			return value == iam.data[need] ? true : false;
		},
		ne: function(value, need, iam) {
			return value != need ? true : false;
		}
	};

	// on blur
	Form.prototype.blur = function () {
		var iam = this;
		if(this.out == undefined) return false;

		$(document).on('blur', 'form#' + this.id + ' input', function () {
			iam.check($(this).attr('name'), iam.out);
		});
	};

	// constructor
	Form.prototype.init = function ( options ) {
		for ( var key in options )
			this[key] = options[key];

		if( this.id == null ) {
			this.error = 'You have to define form id';
			return false;
		}

		this.registerHandler();
		this.blur();
	};

	// registering submit handler
	Form.prototype.registerHandler = function () {
		var iam = this;
		if(FormHandlers[this.id] == undefined) {
			FormHandlers[this.id] = true;
		} else
			return false;

		$(document).on('submit', 'form#' + this.id, function(event, data) {
			// turn off default browser action
			event.preventDefault();

			iam.getData();

			if(iam.before() === false)
				return false;

			// validate form data by the rules
			if(iam.rules != null && iam.validate() == false) {
				var data = {};
				data.valid = iam.valid;
				data.fields = iam.errorFields;
				iam.fails(data);
			}
			else
				iam.send();

			iam.after();
		});
	}

	// get Form data and create unserialize to object
	Form.prototype.getData = function() {
		this.valid = true;
		this.errorFields = {};
		this.data = {};
		this.formObject = $('form#' + this.id);
		data = this.formObject.serializeArray();
		for (var i in data) {
			if(this.data[data[i].name] != null) {
				if(typeof this.data[data[i].name] == 'string')
					this.data[data[i].name] = new Array(this.data[data[i].name]);

				this.data[data[i].name].push(data[i].value);
			}
			else
				this.data[data[i].name] = data[i].value;
		}
	};

	// send form
	Form.prototype.send = function () {
		this.method = this.formObject.attr('method') || this.method;
		this.action = this.formObject.attr('action');
		var iam = this;

		if(this.method && this.action) {
			$.ajax({
				dataType: iam.type,
				url: iam.action,
				type: this.method,
				data: iam.data,
				success: function(response) {
					if(response.error != undefined || response.valid == false)
						return iam.fails(response, iam.data);	
					iam.success(response, iam.data);
				}
			});			
		}
		else
			console.log('Error: Method or action of form is undefined');
	};

	// validate form
	Form.prototype.validate = function () {
		var iam = this;
		for (var key in this.rules) {
			for (var criteria in this.rules[key]) {
				if (this.types[criteria](this.data[key], this.rules[key][criteria]['need'], iam) === false) {
					this.valid = false;
					this.errorFields[key] = this.rules[key][criteria]['error'];
					break;
				}
			}
		}

		return this.valid;
	};

 	// validate some input value
	Form.prototype.check = function (field, cb) {
		this.getData();
		var res = {};
		if(this.rules[field] != undefined) {
			res.name = field;
			for (var criteria in this.rules[field]) {
				res.criteria = criteria;
				if (this.types[criteria](this.data[field], this.rules[field][criteria]['need'], this) === false) {
					res.valid = false;
					return cb(res);
				}
			}
			res.valid = true;
			return cb(res);
		}
	};