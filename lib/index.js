require("JSON2")
require('jstorage');
module.exports = olstree = function(){

  var local_options={
    onclick : onClick,
    save_state : false
  }

  var global_div
  var global_olsontology
  var global_ols_termtype
  var global_ols_iri
  var global_selectpath

  olstree.prototype.draw=function(div, siblings, olsontology, ols_termtype, ols_iri, selectpath, input_options){
    local_options = jQuery.extend(true, {}, local_options, input_options)

    global_div=div
    global_olsontology=olsontology
    global_ols_termtype=ols_termtype
    global_ols_iri=ols_iri
    global_selectpath=selectpath

    showTree(siblings)
  }

olstree.prototype.drawWithSelectBox=function(dropDownMenuDivName, treeDiv, baseURL,options){

    $("#"+dropDownMenuDivName).html('<select class="selectpicker"><option>Select your ontology</option></select>')
    var drop=$("#selectpicker")
    var ontolist=[];
    $.getJSON(baseURL+"/api/ontologies?size=1000", function (data) {
        ontologies=data["_embedded"]["ontologies"]
        for (var i=0;i<ontologies.length; i++)
        {
            ontolist.push({'id':ontologies[i]["ontologyId"], 'title':ontologies[i]["config"]["title"]})
        }

        $.each(ontolist, function(index, option){
          $("#"+dropDownMenuDivName+" .selectpicker").append("<option value='"+option.id+"'>"+option.id+" - "+option.title+"</option>")
        })

        $("#"+dropDownMenuDivName+' .selectpicker').on('change', function(){
           var selected = $("#"+dropDownMenuDivName+' .selectpicker option:selected').val();
           olstree.prototype.draw(treeDiv, false, selected, 'terms', '', baseURL, options);
        });

    }).fail(function(){console.log("something went wrong with the webservice call");})
}

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


olstree.prototype.toggleSiblings=function(elm) {
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




function showTree(siblings) {
        global_div.empty();
        global_div.each(function(){

        var ontologyName = global_olsontology;
        var termType = getUrlType(global_ols_termtype);
        var termIri = global_ols_iri;
        var relativePath = global_selectpath ? global_selectpath : '';

        // build tree
        $.jstree.defaults.core.data = true;
        $.jstree.defaults.core.expand_selected_onload = true;

        var rootUrl = relativePath + '/api/ontologies/' + ontologyName + '/' + termType + '/roots?size=500';

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
                            // render a single terms
                            if (local_options.save_state && $.jStorage.get(termIri)) {
                                cb($.jStorage.get(termIri))
                            } else {
                                $.getJSON(url, function (data) {
                                        cb(data)
                                    })
                                    .fail(function(){
                                        console.log("Could not connect to "+url)
                                    });
                            }
                        }
                        else if (node.id === '#' && termIri === '') {

                            // show roots
                            $.getJSON(rootUrl, function (data) {
                                var data = _processOlsData(data, '#', termType);
                                cb(data)
                            })
                            .fail(function(){
                            console.log("Could not connect to "+url)
                          });
                        }
                        else {
                            var requestIri = node.original.iri ? node.original.iri : node.original.a_attr.iri;
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

                        // clear local storage for this term
                        if (local_options.save_state) {
                            if (termIri != '' && $.jStorage.get(termIri)) {
                                $.jStorage.deleteKey(termIri)
                            }
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
                var  data = $(this).jstree(true).get_json();
                var iri  = selected.node.original.iri ? selected.node.original.iri : selected.node.original.a_attr.iri
                var ontology =  selected.node.original.ontology_name ? selected.node.original.ontology_name : selected.node.original.a_attr.ontology_name
                if (local_options.save_state) {
                    $.jStorage.set(iri, data);
                }
                local_options.onclick.call(this, event, selected, relativePath, termIri, termType, iri, ontology)
            }).bind('after_close.jstree', function (e, data) {
                var tree = $(this).jstree(true);
                tree.delete_node(data.node.children);
                tree._model.data[data.node.id].state.loaded = false;
            });
        $(this).append(treeDiv);

    });
}

//Default onclick behavior
function onClick(node, event, relativePath, currentTermIri, termType, selectedIri, ontology_name){
  var type = termType;
  if (type == 'individuals' && termIri != selectedIri) {
      type = getUrlType('terms');
    }

  var newpath=relativePath + "ontologies/" + ontology_name + "/" + type + '?iri=' + encodeURIComponent(selectedIri)
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
                "children" : term.has_children,
                "a_attr" : {
                    "iri" : term.iri,
                    "ontology_name" : term.ontology_name,
                    "title" : term.iri,
                    "class" : "is_a"
                }
            }
        );
        counter++;
    });
    return newData;
}
}
