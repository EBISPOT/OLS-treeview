require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"ols-treeview":[function(require,module,exports){

module.exports = olstree = function(){

var local_options={
  onclick : onClick
}

olstree.prototype.draw=function(div, siblings, olsontology, ols_termtype, ols_iri, selectpath, input_options){
  console.log(input_options)
  local_options = jQuery.extend(true, {}, local_options, input_options)
  console.log(input_options)
  showTree(div, siblings, olsontology, ols_termtype, ols_iri, selectpath)
}

// these two functions come from ols.js
function getUrlType (type) {
    var urlType = 'terms';
    if (type == 'property') {
        urlType = 'properties';
    }
    else if (type == 'individual') {
        urlType= 'individuals';
    }
    else if (type == 'ontology') {
        urlType= 'ontology';
    }
    return urlType;
}

function goTo (url) {
    window.location.href =  url;
}
///////End of content ols.js

function toggleSiblings(elm) {

    var buttonValue = $(elm).val() == 'true';

    if (buttonValue) {
        $(elm).text("Hide siblings");
        $(elm).val(false);
    }
    else {
        $(elm).text("Show siblings");
        $(elm).val(true);

    }
    showTree(buttonValue)
}



//olstree.prototype.showTree=function(siblings, olsontology, ols_termtype, ols_iri, selectpath) {

function showTree(div, siblings, olsontology, ols_termtype, ols_iri, selectpath) {
//    $( "div[data-olswidget='tree']").empty();
//   $( "div[data-olswidget='tree']" ).each(function() {

    console.log(div)
    console.log(siblings)
    console.log(olsontology)
    console.log(ols_termtype)
    console.log(ols_iri)



        div.empty();
        div.each(function(){


        var ontologyName = olsontology;
        var termType = getUrlType(ols_termtype);
        var termIri = ols_iri;
        var relativePath = selectpath ? selectpath : '';

        // build tree
        $.jstree.defaults.core.data = true;
        $.jstree.defaults.core.expand_selected_onload = true;

        var rootUrl = relativePath + '/api/ontologies/' + ontologyName + '/' + termType + '/roots?size=1000';

        var baseUrl = relativePath + '/api/ontologies/' + ontologyName + '/' + termType + '/';
        var url = baseUrl + encodeURIComponent(encodeURIComponent(termIri)) + '/jstree' ;

        if (siblings) {
            url += '?siblings=true';
        }

        var treeDiv = $('<div></div>')
            .jstree({
                'core' : {
                    'data': function (node, cb) {
                        //console.log("node id: " + node.id + " term " + termIri);

                        if (node.id === '#' && termIri != '') {
                            console.log(url)
                            $.getJSON(url, function (data) {
                                cb(data)
                            })
                            .fail(function(){
                            console.log("Could not connect to "+url)
                          });
                        }
                        else if (node.id === '#' && termIri === '') {

                            // show roots
                            $.getJSON(rootUrl, function (data) {
                                var data = _processOlsData(data, '#', termType);
                                console.log("termIri "+termIri+" leads to"+data)
                                console.log("With the rootUrl "+rootUrl)
                                cb(data)
                            })
                            .fail(function(){
                            console.log("Could not connect to "+url)
                          });
                        }
                        else {
                            var requestIri = node.original.iri;
                            // get all children
                            var childUrl = baseUrl + encodeURIComponent(encodeURIComponent(requestIri)) + '/jstree/children/'+ node.id;
                            //console.log('child url: '+childUrl)

                            $.getJSON(childUrl, function (data) {
                                //console.log("termIri "+termIri+" leads to"+data)
                                //console.log("With the childUrl "+childUrl)
                                cb(data)

                            })
                            .fail(function(){
                              console.log("Could not connect to "+url)
                            });
                        }

                    },
                    "themes": {
                        "dots": true
                        , "icons": false,
                        "name" : "proton"
                        //"responsive" : true
                    }
                },
                plugins: ["sort"]
            }).bind("select_node.jstree", function(node, selected, event) {
              local_options.onclick.call(this, node, selected, relativePath, termIri, termType)

            });
        $(this).append(treeDiv);

    });
}

//Default onclick behavior
function onClick(node, selected, relativePath, termIri, termType){
  var type = termType;
  if (type == 'individuals' && termIri != selected.node.original.iri) {
      type = getUrlType('terms');
    }

  var newpath=relativePath + "ontologies/" + selected.node.original.ontology_name + "/" + type + '?iri=' + encodeURIComponent(selected.node.original.iri)
  //console.log(newpath)
  goTo(newpath)
}


function _processOlsData (data, parentId, termType) {
    var newData = [];
    var counter = 1;
    var results = [];

    if (data._embedded != undefined) {
        if (termType == "properties") {
            results = data._embedded.properties;
        }
        else if (termType == "individuals") {
            results = data._embedded.individuals;
        }
        else if (termType == "terms") {
            results = data._embedded.terms;
        }
    }
    $.each(results, function(index, term) {
        var id = parentId + "_" + counter;
        var parent = parentId;
        if (parentId === '#') {
            id = counter;
            parent = parentId;
        }

        newData.push(
            {
                "id" : id,
                "parent" : parent,
                "iri" : term.iri,
                "ontology_name" : term.ontology_name,
                "text" : term.label,
                "leaf" : !term.has_children,
                "children" : term.has_children
            }
        );
        counter++;
    });
    return newData;
}
}

},{}]},{},[]);
