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
var smushit = require('gulp-smushit');
var gzip = require('gulp-gzip');
var changed = require('gulp-changed');
var config = require('./gulpConfig.json');



var projectDirectory = (config.project == undefined) ? "**/" : config.project;
var enableGzip = (config.enableGzip == undefined) ? false : config.enableGzip;
var gulpOutputDir = (config.outputDestination == undefined) ? "gulpBuild/" : config.outputDestination + "gulpBuild/";
var targetImageDirectory = (config.targetImageDirectory == undefined) ? projectDirectory : config.targetImageDirectory;
var ignoreList = config.ignore == undefined ? [] : config.ignore;

/*
  Output directory paths
 */
var minifiedFiles = gulpOutputDir + "minifiedFiles/";
var optimizedImgPath = gulpOutputDir + "optimizedImages/";
var uglifyCssPath = gulpOutputDir + "uglifyCss/";
var uglifyJSPath = gulpOutputDir + "uglifyJs/";


/*
  by default ignore gulp output directory and gulpfile.js
 */
ignoreList.push('!' + gulpOutputDir + '**/*.*', '!gulpfile.js');

/*
  function to read files and send to uglify process
 */
function minifyAndConcat(fileSet, type) {
  var destPath = "";
  if (type == "js") {
    destPath = uglifyJSPath;
  } else if (type == "css") {
    destPath = uglifyCssPath;
  }
  for (var key in fileSet) {
    var files = fileSet[key].files.map(function(p) {
      return minifiedFiles + p.replace("." + type, ".min." + type);
    })
    generateCustomUglify(files, key, type, destPath);
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
function generateCustomUglify(files, fileName, type, destinationPath) {
  var uglFile = gulp.src(files)
    .pipe(concat(fileName + '.min.' + type))
    .pipe(gulp.dest(destinationPath))

  if (enableGzip) {
    uglFile.pipe(gzip({
      append: true
    })).pipe(gulp.dest(destinationPath))
  }
  return uglFile;
}

/*
  - Automated Gulp watcher will watch the changes made to source file and re generate the output file if any chanes is occured
 */
gulp.task('watcher', function() {
  // watcher that watch any changes made to minifiedFiles folder if done then execute the generateDeploymentFiles
  gulp.watch([minifiedFiles + '**/*.*'], ['generateDeploymentFiles']);

  // if changes done to source file
  gulp.watch([projectDirectory + '**/*.*'].concat(ignoreList))
    .on("change", function(file) {
      // if deleted then get the path of source file and output file and sync the delete process to delete that output
      if (file.type == "deleted") {
        var filePathFromSrc = path.relative(path.resolve(projectDirectory), file.path);
        filePathFromSrc = filePathFromSrc.substring(filePathFromSrc.indexOf("..\\") + 3, filePathFromSrc.length);
        if (filePathFromSrc.indexOf(".css") > -1) {
          filePathFromSrc = filePathFromSrc.replace(".css", ".min.css");
        } else if (filePathFromSrc.indexOf(".js") > -1) {
          filePathFromSrc = filePathFromSrc.replace(".js", ".min.js");
        }
        var destFilePath = path.resolve(minifiedFiles, filePathFromSrc);
        var destFilePathGZ = path.resolve(minifiedFiles, filePathFromSrc + ".gz");

        del.sync(destFilePath);
        del.sync(destFilePathGZ);
      }
      // if changed or new file created then re generate the minifyCss and minifyJs
      // on regerating these files above watcher is also executed because changes in minifiedFiles folder is detected
      else {
        if (file.path.indexOf(".css") > -1) {
          console.log("test");
          gulp.start('minifyCss');
        } else if (file.path.indexOf(".js") > -1) {
          gulp.start('minifyJs');
        }
      }
    })
});

/*
  - Task to generate the uglified version of js and css using minified file from gulpBuild/minifiedFiles folder
 */
gulp.task('generateDeploymentFiles', function() {
  // if css and js file is specified the generate the single uglify version of listed files or folder
  if (config.css || config.js) {
    for (var key in config) {
      if (Object.keys(config[key]).length > 0 && (key == "js" || key == "css")) {
        minifyAndConcat(config[key], key);
      }
    }
  }

  //if generateGlobalFiles is true in config generate single uglify file of all files inside the minifiedFiles folder
  if (config.generateGlobalFiles) {
    if (config.css && config.js == undefined) {
      generateCustomUglify(minifiedFiles + '**/*.js', "global", "js", uglifyJSPath);
    } else if (config.css == undefined && config.js) {
      generateCustomUglify(minifiedFiles + '**/*.css', "global", "css", uglifyCssPath);
    } else if (config.css == undefined && config.js == undefined) {
      generateCustomUglify(minifiedFiles + '**/*.js', "global", "js", uglifyJSPath);
      generateCustomUglify(minifiedFiles + '**/*.css', "global", "css", uglifyCssPath);
    }
  }
})

/*
  - Task to generate the minified version of Js
 */
gulp.task('minifyCss', function() {
  var files = [projectDirectory + '**/*.css'].concat(ignoreList)
  var destination = minifiedFiles;
  var cssMin = gulp.src(files, {
      base: "."
    }) // read files
    .pipe(changed(destination, {
      extension: '.min.css'
    }))
    .pipe(plumber()) // prevent process to stop on any error
    .pipe(cssmin()) // minify the css
    .pipe(rename(function(path) {
      path.extname = ".min.css";
    })) // attach the .min.css to file name
    .pipe(gulp.dest(destination)) // save to Destination

  if (enableGzip) {
    cssMin.pipe(gzip({
      append: true
    })).pipe(gulp.dest(destination))
  }
  return cssMin;
})

/*
  - Task to generate the minified version of js
 */
gulp.task('minifyJs', function() {
  var files = [projectDirectory + '**/*.js'].concat(ignoreList);
  var destination = minifiedFiles;
  var jsMin = gulp.src(files) // read files
    .pipe(changed(destination, {
      extension: '.min.js'
    }))
    .pipe(plumber()) // prevent process to stop on any error
    .pipe(uglify()) // minify the js
    .pipe(rename(function(path) {
      path.extname = ".min.js";
    })) // attach the .min.js to file name
    .pipe(gulp.dest(destination)) // save to Destination

  if (enableGzip) {
    jsMin.pipe(gzip({
      append: true
    })).pipe(gulp.dest(destination))
  }
  return jsMin;
})


/*
    generate the compressed optimized image of given path
    currently supports only jpg and png format
 */
gulp.task('optimizeImage', function() {
  return gulp.src([
      projectDirectory + '**/*.{jpg,png}'
    ].concat(ignoreList))
    .pipe(smushit())
    .pipe(gulp.dest(optimizedImgPath));
})

gulp.task('clear', function() {
  del.sync(gulpOutputDir);
})

/*
- Single task to execute all four task at once
- first execute minifyCss & minifyJs parallel and after that execute generateDeploymentFiles and watcher
 */
gulp.task('default', function() {
  runSequence('clear', ['minifyCss', 'minifyJs'], 'generateDeploymentFiles', 'watcher');
})
