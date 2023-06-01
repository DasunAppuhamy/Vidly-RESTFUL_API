const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const authorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String
});

const Author = mongoose.model('Author', authorSchema);

const Course = mongoose.model('Course', new mongoose.Schema({
  name: String,
  authors: {
    type: [authorSchema],
    required: true
  }
}));

async function createCourse(name, authors) {
  const course = new Course({
    name, 
    authors
  }); 
  
  const result = await course.save();
  console.log(result);
}

async function listCourses() { 
  const courses = await Course.find();
  console.log(courses);
}

async function updateCourse(courseID){
  // const course = await Course.findById(courseID);
  // course.author.name = "Dash";
  // course.save();

  // const course = await Course.updateMany({ _id: courseID }, {
  //   $unset: {
  //     'author': ''
  //   }
  // })

  const course = await Course.updateMany({ _id: courseID }, {
    $set: {
      'author.name': 'Sachichchi'
    }
  })
}

async function addAuthor(courseId, author){
  const course = await Course.findById(courseId);
  course.authors.push(author);
  course.save();
}

async function removeAuthor(courseId, authorId){
  const course = await Course.findById(courseId);
  const author = course.authors.id(authorId);
  author.deleteOne();
  course.save();
}

//updateCourse('64614de06e2b24deda3c8c0c');

// addAuthor('646158f66009c8561f2bf0c7', new Author({
//   name: 'John'
// }))

removeAuthor('646158f66009c8561f2bf0c7', '64615918ad961beffb739c8c');

// createCourse('Node Course', [
//   new Author({ name: 'Mosh' }),
//   new Author({ name: 'Dash' }),
// ]);
