
Gulp
===================

gulp is the node based tool which is used to automate the several repetitive tasks like magnification , uglify  , conversation of scss and less and many more.

About
-------------
To simplify the process of using gulp and try to creating the medium as a config file where user will specify the required configs in json file and based on that it gulp tasks will generate the output files

Task Provided
-------------
  - minifyJs - generate minified version of js file of source directory
  - minifyCss - generate minified version of css file of source directory
  - generateDeploymentFiles -  generate the single common js and css file from the minifed version of files
  - Watcher - automated process to keep watch on source directory and on any changes occured regerate the new output files
  - default - single process to execute all of the above process at once


Output Files Folder Structure
===================
This gulp process will create the folder by name "guilpbuild" at specified output Destination and inside that folder it will create 3 folders minifiedFiles , uglifyCss and uglifyJs.

* [gulpBuild]()
 * [minifiedFiles ]()
 * [uglifyCss ]()
 *  [uglifyJs]()

##### minifiedFiles
	minifedFiles folder have the same directory structure as source path ,it holds similar folder and subfolders source path has and that folder contains the minified version of css and js.

	minifyCss and minifyJs task will do this process

##### uglifyCss , uglifyJs

	This folder contain the merge uglified version of all css and js files inside the minifiedFiles folder . to generate the uglify file it use the config ,if list of css and js files is specify in config then tasks will generate the uglify files using that set of files , if not specified then it will merge all css and js exist inside the minifiedFiles folder and generate global.css anf global.js

After all this files are generate use this files at required html pages

----------


gulpConfig.json
===================
gulpConfig.json is the json config file gulp task use this config file to get necessary information for the execution of task.  

following parameters are necessary to specify in config file to execute task . gulpConfig.json config file can be like this.

```json
{
    "project":"public/Dmaterial/assets",
    "outputDestination":"public/Dmaterial/",
    "generateGlobalFiles" : false,
    "css":{
       "global":{
          "files":[
            "css/bootstrap.css",
            "css/scaffolding.css",
            "css/zdepth.css",
            "css/utilities.css"
          ]
       }
    },
    "js":{
       "test":{
          "files":[
            "js/**/*.js"
          ]
       }
    }
}

```
##### project
	specify path of the source project here
##### outputDestination
	specify path of the generated output files here
##### css , js
	To generate the uglify files you can specify the json inside the css. keys will be considered as a name of files and each key values will be array which containe list of files or path of directory.
	Eg:  
	"css":{
	  "global":{ // create the global.min.css in uglifyCss folder
         "files":[ // use bellow files from project specified path
	        "css/bootstrap.css",
	        "css/scaffolding.css",
	        "css/zdepth.css",
	        "css/utilities.css"
	        "bootstrap/**/*.css" // target all css files of bootstrap folder and subfolders
	          ]
	       }

##### generateGlobalFiles
	If true and css or js params is not specified in json then it will generate the merge and minified  global.min.css or global.min.js using all css and js files inside the minifiedFiles folder



  Build With
-------------

 - Node.js - [<i ></i> nodejs.org](https://nodejs.org/en/)
 - Gulp -  [<i ></i> gulpjs.com](http://gulpjs.com/)

  ----------

Dependent Node Modules
-------------

 - path - [<i ></i> nodejs.org](https://nodejs.org/en/)
 - gulp -  [<i ></i> npmjs.com/package/gulp](https://www.npmjs.com/package/gulp)
 - gulp-rename -  [<i ></i> npmjs.com/package/gulp-rename](https://www.npmjs.com/package/gulp-rename)
 - gulp-cssnano -  [<i ></i> npmjs.com/package/gulp-cssnano](https://www.npmjs.com/package/gulp-cssnano)
 - gulp-uglify -  [<i ></i> npmjs.com/package/gulp-uglify](https://www.npmjs.com/package/gulp-uglify)
 - gulp-concat -  [<i ></i> npmjs.com/package/gulp-concat](https://www.npmjs.com/package/gulp-concat)
 - gulp-plumber -  [<i ></i> npmjs.com/package/gulp-plumber](https://www.npmjs.com/package/gulp-plumber)
 - gulp-watch -  [<i ></i> npmjs.com/package/gulp-watch](https://www.npmjs.com/package/gulp-watch)
 - del -  [<i ></i> npmjs.com/package/del](https://www.npmjs.com/package/del)
 - run-sequence -  [<i ></i> npmjs.com/package/run-sequence](https://www.npmjs.com/package/run-sequence)

  ----------


   Authour
-------------

 - Ashish M Patel
