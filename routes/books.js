const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg','image/jpg', 'image/png', 'image/gif']
const Author = require('../models/author')

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback)=>{
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})
// Todos los libros
router.get('/', async (req, res) =>{
  let query = Book.find({})
  if(req.query.title != null && req.query.title !=''){
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishBefore != null && req.query.publishBefore != "") {
    query = query.lte("publishDate", req.query.publishBefore);
  }
  if (req.query.publishAfter != null && req.query.publishAfter != "") {
    query = query.gte("publishDate", req.query.publishAfter);
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
    books: books,
    searchOptions: req.query
    })
  } catch  {
    res.redirect('books')
  } 
})


// plantilla Nuevo libro
router.get("/new", async (req, res) =>{
  renderNewPage(res, new Book())
})

//Guardar nuevo libro
router.post('/', upload.single('cover'), async(req, res) =>{
  const filename = req.file != null ? req.file.filename : null
  // console.log(body);
  
  const book =  new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: filename,

    description: req.body.description
  })
  console.log(book);
  
  try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect('books/')
  } catch(err) {
    if(book.coverImageName != null){
      removeBookCover(book.coverImageName)
    }
    console.log(err);    
    renderNewPage(res, book, true)
  }
})

function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), error=>{
    if(error) console.error(error);
    
  })
}

async function renderNewPage(res, book, hasError= false) {
  try {
    const authors =  await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if(hasError) params.errorMessage = 'Error creando Libro'
    res.render('books/new', params)
  } catch  {
    res.redirect('/books')
  }
}

module.exports = router