var Errors = {
	required: 'Обязательно для заполнения',
};

var Rules = {
	required: {error: Errors.required}
};

// forms go
var options = new Form({
	type: 'text',
	id: 'options',
	rules : {
		'city': {required: Rules.required},
		'days' : {required: Rules.required},
		'view': {required: Rules.required}
    },

    before: function () {
    	$('div').css({'border' : 'none'});
    },

	success: function(data) {
		$('#code').html(data).show();
	},

	fails: function (errors) {
		fields = errors.fields;
		for (var key in fields)
			$('[name="'+key+'"]').parent().css({'border' : '1px solid red'});
	}
});
