var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('uglify', function(){
 console.log("This is the task uglify from gulp, this MIGHT TAKE A WHILE");
 return gulp.src('build/ols-treeview.js')
 .pipe(uglify())
 //.pipe(rename({extname: '.min.js'}))
 .pipe(gulp.dest('build'));
})
