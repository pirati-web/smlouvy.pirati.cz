---
---

/**
 * @param {string} format: mm/dd/yyyy , or yyyy-mm-dd
 * @return {string} format: yyyy-mm-dd
 */
var convertDate = function(date) {
	var correctDate = /\d{4}-\d{2}-\d{2}/i
	if( correctDate.test(date) ) {
		return date;
	}
	var splited = date.split('/');
	return splited[2] + '-' + splited[0] + '-' + splited[1];
}

/**
 * @param {string} format: yyyy-mm-dd
 */
var createBasePath = function(date) {
	var splited = date.split('-');
	var year = splited[0];
	var month = splited[1];
	var day =  splited[2];
	return 'smlouvy/' + year + '/' + month + '/' + day + '/';
}

/**
 * After success upload function
 */
var done = function() {
	console.log('done');
	console.log('ok');
	$('#upload-done').show();
	$("#upload-form").hide();
}

/**
 * Send data into github.com (use octokit.js)
 * Actual versions use patched octokit:
 * https://github.com/philschatz/octokit.js/pull/72
 * @param {string} basePath repository path
 * @param {string} token github acess token to the repository
 * @param {object} files name: content
 * @param {string} message commit message
 */
var sendToGithub = function(basePath, token, files, message) {
	console.log('sendToGithub');
	var github = new Octokit({
		token: token
	});

	var repoName = "{{ site.["github"]["repo"] }}";
	var userName = "{{ site.["github"]["user"] }}";
	var repo = github.getRepo( userName, repoName);
	var branch = repo.getBranch();

        for( var key in files ){
            files[basePath + key] = files[key];
            delete files[key];
	};

	branch.writeMany(files, message).then(function(res) {
		if(res) {
			done();
		} else {
			console.error(res);
			alert('Nezdařilo se poslat data.');
		}
	});
}

/**
 *  we could use ... https://gist.github.com/StephanHoyer/91d8175507fcae8fb31a
 */
var sendToGithub_octokat = function(basePath, token, files, message) {
	console.log('sendToGithub');
	var github = new Octokat({
		token: token
	});

	var repoName = "{{ site.["github"]["repo"] }}";
	var userName = "{{ site.["github"]["user"] }}";
	var repo = github.repos( userName, repoName).fetch();
        return;
	var branch = repo.branches('gh-pages').create();

	_.each(files, function(val, key) {
		files[basePath + key] = val;
		delete files[key];
	}, this);

	branch.writeMany(files, message).then(function(res) {
		if(res) {
			done();
		} else {
			console.error(res);
			alert('Nezdařilo se poslat data.');
		}
	});
}

/**
 * Reads binary file, encode them into base64 and then call callback
 * @param {string} elId element id
 * @param {object} files
 * @param {string} basePath
 * @param {callback}
 * @param {string} token
 * @param {string} name
 */
var readFilesAndCall = function(elId, files, basePath, callback, token, message, name) {
	var el = document.getElementById(elId);
	var reader = new FileReader();
	var count = (el.files.length || 0);
	var processedCount = 0;

	for (var i = 0; i < count; i++) {
		var file = el.files[i];
		reader.onloadend = function(evt) {
			if (evt.target.readyState == FileReader.DONE) {
				var fileContent =  evt.target.result.substring('data:application/octet-stream;base64,'.length);
				files[ file.name ] = {
					isBase64: true,
					content: fileContent
				};
			} else {
				console.warn(evt.target.error);
			}
			processedCount++;
			if(processedCount == count) {
				sendToGithub(basePath, token, files, message);
			}
		};
		var blob = file.slice(0, file.size);
		reader.readAsDataURL(blob);
	}
}

/**
 * Handle data:
 * - converts dates into proper format
 * - crteate yaml file
 * @param {event} e
 * @param {} control
 */
var handleData = function(e, control) {
	var values = control.getValue();
	var token = values.token;

	if(typeof(values.costs) === undefined) {
		values.costs = 0;
	}

	var text = '---\n"layout": contract' +
	'\n"datum podpisu": ' +
	convertDate(values.sign) +
	'\n"datum účinnosti": ' +
	convertDate(values.effective) +
	'\n"title": "' +
	values.heading + '"' +
	'\n"předmět": "' +
	values.subject + '"' +
	'\n"stav": ' +
	values.status +
	'\n"náklady": ' +
	values.costs +
	'\n"místo uložení": ' +
	values.location +
	'\n"výběrko": ' +
	values.tender +
	'\n"smluvní strany":';

	for(var i = 0; i < values.parties.length; i++) {
		var party = values.parties[i];
		text += "\n -\n";
		text += '  "jméno": "' + party.name + '"\n';
		text += '  "orgán": ' + party.organization + '\n';
		text += '  "zástupce": ' + party.agent + '\n';
		text += '  "funkce": ' + party.function + '\n';
		text += '  "role": ' + party.role + '\n';
		text += '  "sign": ' + party.sign + '\n';
	}
	text += '"soubory":\n';
	text += ' -\n  "podepsaná verze": ' + values.docs + '\n';
	text += '---';

	var basePath = createBasePath(convertDate(values.sign));
	var message = 'Nahrání smlouvy ' + values.name + ' ze dne ' +  values.sign;

	readFilesAndCall('files-id', {'index.html': text}, basePath, sendToGithub, token, message, values.docs);
};

/**
 * Form init function
 */
var prepare = function() {
	$('#upload-alert').hide();
	$('#upload-done').hide();
	$("#upload-form").alpaca({
		"optionsSource": "/assets/js/options.json",
		"schemaSource": "/assets/js/schema.json",
		"postRender": function(control) {
			var form = control.form;
			if (form) {
				form.registerSubmitHandler(function(e, control) {
					e.preventDefault();
					handleData(e, control);
					return false;
				});
			}
		}
	});
}

/**
 * Init function
 */
$(document).ready(function () {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		prepare();
	} else {
		$('#main-upload-form').hide();
		alert('The File APIs are not fully supported in this browser.');
	}
});
