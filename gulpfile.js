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

function generateCustomUglify(files,fileName,type,destinationPath){
  if(type=="css"){
      gulp.src(files)
    //  .pipe(cssnano())
     .pipe(concat(fileName+'.min.'+type))
     .pipe(gulp.dest(destinationPath))
  }else if(type=="js"){
      gulp.src(files)
      // .pipe(uglify())
     .pipe(concat(fileName+'.min.'+type))
     .pipe(gulp.dest(destinationPath))
  }
}

gulp.task('watcher',function(){
  gulp.watch([minifiedFiles+'**/*.*'],['generateDeploymentFiles'])


  gulp.watch([projectDirectory+'**/*.*','!'+gulpOutputDir+'**/*.*'].concat(ignoreList))
  .on("change",function(file){
    if(file.type=="deleted"){
        var filePathFromSrc = path.relative(path.resolve(projectDirectory), file.path);
        if(filePathFromSrc.indexOf(".css")>-1){
            filePathFromSrc=filePathFromSrc.replace(".css",".css");
        }else if(filePathFromSrc.indexOf(".js")>-1){
            filePathFromSrc=filePathFromSrc.replace(".js",".js");
        }
        var destFilePath = path.resolve(minifiedFiles+targetResource, filePathFromSrc);
        del.sync(destFilePath);
    }else{
        console.log(JSON.stringify(file));
        if(file.path.indexOf(".css")>-1){
            gulp.start('minifyCss');
        }else if(file.path.indexOf(".js")>-1){
            gulp.start('minifyJs');
        }
    }
  })
});

gulp.task('generateDeploymentFiles',function(){
    if(config.css && config.js){
      for(var key in config){
          if(Object.keys(config[key]).length>0 && (key=="js" || key=="css")){
            minifyAndConcat(config[key],key);
          }
      }
    }
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


gulp.task('minifyCss',function(){
    return  gulp.src([
     projectDirectory+'/**/*.css'
    ].concat(ignoreList))
  //  .pipe(watch(projectDirectory+'/**/*.css'))
  //  .pipe(plumber())
   .pipe(cssmin())
   .pipe(rename(function(path) {
     path.extname = ".min.css";
   }))
   .pipe(gulp.dest(minifiedFiles+targetResource));
})


gulp.task('minifyJs',function(){
    return  gulp.src([
     projectDirectory+'/**/*.js'
    ].concat(ignoreList))
  //  .pipe(watch(projectDirectory+'/**/*.js'))
   .pipe(plumber())
   .pipe(uglify())
   .pipe(rename(function(path) {
     path.extname = ".min.js";
   }))
   .pipe(gulp.dest(minifiedFiles+targetResource));
})

gulp.task('default',function(){
    runSequence(['minifyCss','minifyJs'],'generateDeploymentFiles','watcher');
})
