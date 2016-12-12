var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var del = require('del');
var runSequence = require('run-sequence');
var config = require('./gulpConfig.json');


config.outputDestination = (config.outputDestination==undefined)?"gulpBuild/":config.outputDestination+"gulpBuild/";

var targetResource = config.targetResource!=undefined?config.targetResource:"";
var projectDirectory = config.project + targetResource;
var gulpOutputDir = config.outputDestination;
var minifiedFiles = gulpOutputDir + "minifiedFiles/";
var uglifyCssPath = gulpOutputDir+"uglifyCss/";
var uglifyJSPath = gulpOutputDir+"uglifyJs/";

var ignoreList = config.ignore==undefined?[]:config.ignore;

/*
  function to read files and send to uglify process
 */
function minifyAndConcat(fileSet,type){
    for(var key in fileSet){
        var fileName = key;
        if(fileSet[key].files && fileSet[key].files.length>0){
          if(type == "css"){
            var files = fileSet[key].files.map(function(p){
                return minifiedFiles + p.replace(".css",".min.css");
            })
            generateCustomUglify(files,key,"css",uglifyCssPath);
          }else if(type == "js"){
            var files = fileSet[key].files.map(function(p){
                return minifiedFiles + p.replace(".js",".min.js");
            })
            generateCustomUglify(files,key,"js",uglifyJSPath);
          }
        }
    }
}

/*
 -  function to generate the concated css and js file takes bellow paramaters
 parameters
 -  files - Array of files and folder
 -  fileName - Name of output file
 -  type - Type of file css or js
 -  destinationPath - output generated file path
 */
function generateCustomUglify(files,fileName,type,destinationPath){
  if(type=="css"){
      gulp.src(files)
     .pipe(concat(fileName+'.min.'+type))
     .pipe(gulp.dest(destinationPath))
  }else if(type=="js"){
      gulp.src(files)
     .pipe(concat(fileName+'.min.'+type))
     .pipe(gulp.dest(destinationPath))
  }
}

/*
  - Automated Gulp watcher will watch the changes made to source file and re generate the output file if any chanes is occured
 */
gulp.task('watcher',function(){
  // watcher that watch any changes made to minifiedFiles folder if done then execute the generateDeploymentFiles
  gulp.watch([minifiedFiles+'**/*.*'],['generateDeploymentFiles'])

  // if changes done to source file
  gulp.watch([projectDirectory+'**/*.*','!'+gulpOutputDir+'**/*.*'].concat(ignoreList))
  .on("change",function(file){
    //if deleted then get the path of source file and output file and sync the delete process to delete that output file
    if(file.type=="deleted"){
        var filePathFromSrc = path.relative(path.resolve(projectDirectory), file.path);
        if(filePathFromSrc.indexOf(".css")>-1){
            filePathFromSrc=filePathFromSrc.replace(".css",".css");
        }else if(filePathFromSrc.indexOf(".js")>-1){
            filePathFromSrc=filePathFromSrc.replace(".js",".js");
        }
        var destFilePath = path.resolve(minifiedFiles+targetResource, filePathFromSrc);
        del.sync(destFilePath);
    }
    //if changed or new file created then re generate the minifyCss and minifyJs
    //on regerating these files above watcher is also executed because changes in minifiedFiles folder is detected
    else{
        if(file.path.indexOf(".css")>-1){
            gulp.start('minifyCss');
        }else if(file.path.indexOf(".js")>-1){
            gulp.start('minifyJs');
        }
    }
  })
});

/*
  - Task to generate the uglified version of js and css using minified file from gulpBuild/minifiedFiles folder
 */
gulp.task('generateDeploymentFiles',function(){
    // if css and js file is specified the generate the single uglify version of listed files or folder
    if(config.css && config.js){
      for(var key in config){
          if(Object.keys(config[key]).length>0 && (key=="js" || key=="css")){
            minifyAndConcat(config[key],key);
          }
      }
    }

    //if generateGlobalFiles is true in config generate single uglify file of all files inside the minifiedFiles folder
    if(config.generateGlobalFiles){
      if(config.css && config.js==undefined){
          generateCustomUglify(minifiedFiles+'**/*.js',"global","js",uglifyJSPath);
      }else if(config.css==undefined && config.js){
          generateCustomUglify(minifiedFiles+'**/*.css',"global","css",uglifyCssPath);
      }else if(config.css==undefined && config.js==undefined){
          generateCustomUglify(minifiedFiles+'**/*.js',"global","js",uglifyJSPath);
          generateCustomUglify(minifiedFiles+'**/*.css',"global","css",uglifyCssPath);
      }
    }
})

/*
  - Task to generate the minified version of Js
 */
gulp.task('minifyCss',function(){
    return  gulp.src([
     projectDirectory+'/**/*.css'
    ].concat(ignoreList))                             // read files
  //  .pipe(watch(projectDirectory+'/**/*.css'))
   .pipe(plumber())                                   // prevent process to stop on any error
   .pipe(cssmin())                                    // minify the css
   .pipe(rename(function(path) {
     path.extname = ".min.css";
   }))                                                // attach the .min.css to file name
   .pipe(gulp.dest(minifiedFiles+targetResource));    // save to Destination
})


/*
  - Task to generate the minified version of js
 */
gulp.task('minifyJs',function(){
    return  gulp.src([
     projectDirectory+'/**/*.js'
   ].concat(ignoreList))                                // read files
  //  .pipe(watch(projectDirectory+'/**/*.js'))
   .pipe(plumber())                                     // prevent process to stop on any error
   .pipe(uglify())                                     // minify the js
   .pipe(rename(function(path) {
     path.extname = ".min.js";
   }))                                                // attach the .min.js to file name
   .pipe(gulp.dest(minifiedFiles+targetResource));    // save to Destination
})

/*
- Single task to execute all four task at once
- first execute minifyCss & minifyJs parallel and after that execute generateDeploymentFiles and watcher
 */
gulp.task('default',function(){
    runSequence(['minifyCss','minifyJs'],'generateDeploymentFiles','watcher');
})
