# Introduction
The purpose of this plugin is enable people to include a standalone ontology treeview in their own project. It is used and was developed for the Ontology Lookup Service (OLS) hosted by the European Bioinformatics Institute (EBI) and can be seen there in action (e.g. <a href="http://www.ebi.ac.uk/ols/ontologies/efo/terms?iri=http%3A%2F%2Fwww.ebi.ac.uk%2Fefo%2FEFO_0000322">here</a>)  

# How to implement the plugin
There are multiple ways of implementing the plugin:
- You can download the javascript file stored in the build folder and include the file by using normal script tags. See the example html pages for more information. (<a href="https://github.com/LLTommy/OLS-treeview">github</a>)
- The plugin is available as npm module - search for ols-treeview or follow <a href="https://www.npmjs.com/package/ols-treeview">this link</a> (use *npm install* and *npm run build* to install the dependencies and build and uglify the project)
- The widget is listed on the <a href="http://www.biojs.io">bio.js website</a> where you could find other interesting visualisation for biological data

# How to start the plugin
```
var app = require("ols-treeview");
var instance = new app();
//instance.draw($("#term-tree"), false, "bfo", "terms", "http://purl.obolibrary.org/obo/BFO_0000182", "http://localhost:8080/ols-boot/", {});
instance.draw($("#term-tree"), false, "bfo", "terms", "http://purl.obolibrary.org/obo/BFO_0000182", "http://www.ebi.ac.uk/ols", {});
```

The plugin has a couple of input parameters, namely "div", "showSibblings", olsontology, ols_termtype, ols_iri, path, input_options:
- *div*: Is a div object, the place where the tree will be shown (e.g.: $("#term-tree"))
- *showSibblings*: true or false - this is a flag that adjusts if a the siblings are shown or not at startup
- *olsontology*: Short Name of the ols ontology of the term you want to display (e.g. efo, bfo, ...) - a list of available ontologies can be found here  (e.g. http://www.ebi.ac.uk/ols/ontologies)
- *ols_termtype*: Can have the value terms, property, individual or ontology - depending on the classification of the thing in ols
- *ols_iri*: Is the iri the term has in ols (e.g.: http://purl.obolibrary.org/obo/BFO_0000182, http://purl.obolibrary.org/obo/GO_0098743, ...  )
- *path*: Is the base path of service - where the tree gets its data from. In (almost) all cases this is going to be http://www.ebi.ac.uk/ols (except if you e.g. run a local instance of <a href="http://www.ebi.ac.uk/ols/">OLS</a> that you want to link the plugin to)
- *input_options*: This field offers two options: **1** the possibility to overwrite the onclick function and therefore to handle click events in a different way. Check example2 for more information. If the option field is empty {} the widget is started with default behavior - which means it links to the ols main page in case of a click event. **2** The variable *save_state* (values true/false) influences how the tree behaves while browsing through it on clicking on terms. The tree can be redrawn with the focus on the clicked event or the state can be saved.

# Contact
- Please <a href="https://github.com/LLTommy/OLS-graphview">use github</a> to report **bugs**, discuss potential **new features** or **ask questions** in general concerning the module.
- To discuss the Ontology Lookup Service, its features or to report bugs concerning the rest of OLS, please <a href="https://github.com/EBISPOT/OLS/issues">use the OLS github page</a> or contact ols-support@ebi.ac.uk

# Dependencies
* **JQuery**: Is used by the plugin and so it has to be available (https://jquery.com). Download the files or include e.g. https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js as script tag in your html (see examples)
* **jstree**: The tree itself is created by using the jstree library, which you can find here at https://www.jstree.com/. Download the files or include e.g. https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js as script tag in your html (see examples)

# If you are interested in this plugin...
...you might want to have a look at the *ols-graphview* package as well, see <a href="https://github.com/LLTommy/OLS-graphview">Github</a> or <a href="https://www.npmjs.com/package/ols-treeview">npm</a>
