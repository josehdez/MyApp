const express = require('express')
const router = express.Router()
// const multer = require('multer')
// const path = require('path')
// const fs = require('fs')
const Book = require('../models/book')
// const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg','image/jpg', 'image/png', 'image/gif']
const Author = require('../models/author')

// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback)=>{
//     callback(null, imageMimeTypes.includes(file.mimetype))
//   }
// })
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
router.post('/',  async(req, res) =>{
  const book =  new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)
  // console.log('BOOK '+req.body);
  
  try {
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
    // res.redirect('books/')
  } catch(err) {
    console.log('JHC '+err);    
    renderNewPage(res, book, true)
  }
})

//Editar libro
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
    
  } catch (error) {
    res.redirect('/')
  }
});

//Ver libro
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    console.log(book);
    
    res.render("books/show", { book: book });
  } catch (error) {
    res.redirect("/");
  }
});

// Actualizar libro
router.put("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if(req.body.cover != null && req.body.cover !==""){
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch (error) {
    if(book != null){
      renderEditPage(res, book, true)
    }
    else{
      if(book !=null){
        res.render('books/show', {book, book, errorMessage: 'No se pudo eliminar el libro'})
      }
      else{
        res.redirect("/");
      }
    }
  }
});

// borrar libro
router.delete('/:id', async(req, res)=>{
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch (error) {
    res.redirect('/')
  }
})
////////////////////////// funciones auxiliares
async function renderNewPage(res, book, hasError= false) {
  renderFormPage(res, book, 'new' , hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError){
      if(form === 'edit'){
        params.errorMessage = "Error Editando Libro";
      }
      else{
        params.errorMessage = "Error Creando Libro";
      }
    } 
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if(coverEncoded == null || coverEncoded == '') return
  const cover = JSON.parse(coverEncoded)
  // console.log(cover);
  
  if(cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}


module.exports = router