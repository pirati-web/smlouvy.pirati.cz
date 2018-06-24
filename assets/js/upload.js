---
---

/**
 * @param {string} format: mm/dd/yyyy , or yyyy-mm-dd
 * @return {string} format: yyyy-mm-dd
 */
var convertDate = function(date) {
	var correctDate = /\d{4}-\d{2}-\d{2}/i ;
	if( correctDate.test(date) ) {
		return date;
	}

	correctDate = /\d{4}\/\d{2}\/\d{2}/i ;
	if( correctDate.test(date) ) {
            var splited = date.split('/');
            return splited[2] + '-' + splited[0] + '-' + splited[1];
	}

	correctDate = /\d{1,2}\.\d{1,2}.\d{4}/i ;
	if( correctDate.test(date) ) {
            var splited = date.split('.');
            if( splited[0].length == 1 ){
                splited[0] = '0'+splited[0];
            }
            if( splited[1].length == 1 ){
                splited[1] = '0'+splited[1];
            }
            return splited[2] + '-' + splited[1] + '-' + splited[0];
	}

        return '0000-00-00';
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
	$('#upload-done').removeClass('hidden').show();
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
var sendToGithub = function(basePath, token, files, message, values_sign, values_shortheading) {
        /**
         *  we could use ... https://gist.github.com/StephanHoyer/91d8175507fcae8fb31a
         *  but the writeMany function is missing there
         */
	console.log('sendToGithub');
	$('#upload-status').append("odesílám na GitHUB<br/>");
	var github = new Octokit({
		token: token
	});

	var repoName = "{{ site.["github"]["repo"] }}";
	var userName = "{{ site.["github"]["user"] }}";

        var repo = github.getRepo(userName, repoName);
        var br = repo.getBranch('gh-pages');
        var br_new_name = 'smlouva-' + values_sign + "-" + values_shortheading + '-' + ((new Date()).getTime());

	$('#upload-status').append("vytvářím větev " + br_new_name + "<br/>");
        br.createBranch(br_new_name).then(function(rslt){
            for( var key in files ){
                files[basePath + key] = files[key];
                delete files[key];
            };

            var br_new = repo.getBranch(br_new_name);

            $('#upload-status').append("zapisuji soubory <br/>");

            br_new.writeMany(files, message).then(function(res) {
                    if(res) {
                            repo.createPullRequest({
                                "title" : 'PR ' + br_new_name ,
                                "base" : 'gh-pages' ,
                                "head" : br_new_name 
                            }).then(function(rsltpr){
                                done();
                            });
                    } else {
                            console.error(res);
                            alert('Nezdařilo se poslat data.');
                    }
            });
        });

}

/**
 * Reads binary file, encode them into base64 and then call callback
 * @param {string} elId element id
 * @param {object} files
 * @param {string} basePath
 * @param {callback}
 * @param {string} token
 * @param {string} date_signed
 */
var readFilesAndCall = function(elem_ids, files, basePath, callback, token, message, values_sign, values_shortheading) {
	$('#upload-status').append("načítám soubory<br/>");

        var reader, el, count, processedCount, key, val, all_files_elems, file_name, textAdd;

        reader = new FileReader();
        processedCount = 0;
        count = 0;
        all_files_elems = [];
        text_add = "";

        for(key in elem_ids){
            el = document.getElementById(elem_ids[key]);
            for (var i = 0; i < el.files.length; i++) {
                all_files_elems.push(el.files[i]);

                file_name = el.files[i].name;
                switch(elem_ids[key]) {
                    case 'files-id' :
                        textAdd += '  "podepsaná verze": ' + file_name + '\n';
                        break;
                    case 'files2-id' :
                        textAdd += '  "strojově čitelná verze": ' + file_name + '\n';
                        break;
                    case 'files3-id' :
                        textAdd += '  "upravitelná verze": ' + file_name + '\n';
                        break;
                    case 'files4-id' :
                        textAdd += '  "náhled": ' + file_name + '\n';
                        break;
                }

                count += 1;
            };
        }

        textAdd += '---';
        files['index.html'] += textAdd;

        if( count > 0 ){
            var i = 0;
            // to load aal files one by one
            function loadOneFile(){
                var file = all_files_elems[i];
                reader.onloadend = function(evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        var fileContent =  evt.target.result.substring(
                                    'data:application/octet-stream;base64,'.length);
                        files[ file.name ] = {
                            isBase64: true,
                            content: fileContent
                        };
                    } else {
                        console.warn(evt.target.error);
                    }
                    processedCount++;
                    if(processedCount == count) {
                        // all loaded
                        sendToGithub(basePath, token, files, message, values_sign, values_shortheading);
                    } else if ( processedCount < count ){
                        // load next files
                        i += 1;
                        loadOneFile();
                    }
                };
                reader.readAsDataURL(file.slice(0, file.size));
            }

            // start loading files
            loadOneFile();
        } else {
            sendToGithub(basePath, token, files, message, values_sign, values_shortheading);
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

        window.scrollTo(0,0);
	$('#upload-status').append("<br/>vyhodnocuji formulář<br/>");
	$('#upload-pending').removeClass('hidden').show();

        // data validation
        values.sign = convertDate(values.sign);
        values.effective = convertDate(values.effective);
        values.contract_end = convertDate(values.contract_end);
        values.shortheading = values.shortheading.trim();

        if( typeof(values.shortheading) !== undefined ){
            if(! (/^[a-z\-_0-9A-Z ]{5,30}$/.test(values.shortheading) ) ){
                $('#upload-status').append("<br/>chyba ve formátu názvu smlouvy<br/>");
                return;
            }
        } else {
            $('#upload-status').append("<br/>název smlouvy je 'undefined'.<br/>");
        }

        values.shortheading = values.shortheading.replace(/ /g,"-");

	var text = '---\n"layout": contract' +
	'\n"datum podpisu": ' + values.sign +
	'\n"datum účinnosti": ' + values.effective +
	'\n"datum ukončení": ' + values.contract_end +
	'\n"title": "' + values.heading + '"' +
        '\n"použité smluvní typy":' +
        '\n  - ' + values.contract_type +
	'\n"předmět": "' + values.subject + '"' +
	'\n"stav": ' + values.status +
	'\n"náklady": ' + values.costs +
	'\n"místo uložení": ' + values.location +
	'\n"výběrko": ' + values.tender +
	'\n"smluvní strany":\n';

	for(var i = 0; i < values.parties.length; i++) {
		var party = values.parties[i];
		text += " -\n";
		text += '  "jméno": "' + party.name + '"\n';
		text += '  "sídlo": ' + party.sidlo + '\n';
		text += '  "bydliště": ' + party.bydliste + '\n';
		text += '  "IČ": ' + party.ico + '\n';
		text += '  "narozen": ' + party.narozen + '\n';

		text += '  "orgán": ' + party.organization + '\n';
		text += '  "zástupce": ' + party.agent + '\n';
		text += '  "funkce": ' + party.func + '\n';
		text += '  "role": ' + party.role + '\n';
		text += '  "sign": ' + party.sign + '\n';
	}
        
        //  text se připojí až v následujícím volání
	text += '"soubory":\n';
	text += ' -\n';
        /*
	text += ' -\n  "podepsaná verze": ' + values.docs + '\n';
	text += ' -\n  "strojově čitelná verze": ' + values.docs2 + '\n';
	text += ' -\n  "upravitelná verze": ' + values.docs3 + '\n';
	text += ' -\n  "náhled": ' + values.docs4 + '\n';
	text += '---';
        */

	var basePath = createBasePath(values.sign) + values.shortheading + '/';
	var message = 'Nahrání smlouvy ' + values.name + ' ze dne ' +  values.sign;

	readFilesAndCall(['files-id', 'files2-id', 'files3-id', 'files4-id'],
                {'index.html': text}, basePath, sendToGithub, token, message, values.sign, values.shortheading);
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
