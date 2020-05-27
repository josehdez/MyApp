const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
// Todos los autores
router.get('/', async (req, res) =>{
  let searchOptions ={}
  if(req.query.name != null && req.query.name !=''){
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index', {
      authors: authors, 
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
} )

// plantilla Nuevo autor
router.get("/new", (req, res) =>{
  res.render('authors/new', {author: new Author()})
})

//Guardar nuevo author
router.post('/', async (req, res) =>{
  const author = new Author({
    name : req.body.nombre
  })
  try {
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor.id}`)
  } 
  catch (error) {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creando Autor",
    });
  }
 
})

router.get('/:id', async(req, res)=>{
  try {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({author: author.id}).limit(6).exec()
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
    console.log(books);
    
  } catch (error) {
    res.redirect('/')
  }
  // res.send('Mostrar autor' + req.params.id)
})

router.get("/:id/edit", async(req, res) => {
  // res.send("Editar autor" + req.params.id);
  try {
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', {author: author})
  } catch (error) {
    res.redirect('/authors')
  }
});

router.put("/:id", async(req, res) => {
  // res.send("Modificar autor" + req.params.id);
  let author
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
    // res.redirect("authors");
  } 
  catch (error) {
    console.log(error);
    
    if(author == null){
      res.redirect('/')
    }
    else{
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error modificando Autor",
      });
    }
  }
});

router.delete('/:id', async(req, res)=>{
  let author
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name
    await author.remove()
    res.redirect(`/authors/`)
    // res.redirect("authors");
  } 
  catch (error) {
    console.log(error);
    
    if(author == null){
      res.redirect('/')
    }
    else{
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports = router